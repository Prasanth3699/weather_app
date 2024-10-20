from celery import shared_task, chain
import requests
from .models import City, WeatherData, DailySummary, Threshold, Alert, ForecastData
from django.db.models import Avg, Max, Min, Count
from collections import Counter
from django.conf import settings
from datetime import datetime, timedelta, timezone as dt_timezone
from django.utils import timezone as dj_timezone
from django.contrib.auth.models import User
from django.core.mail import send_mail
import logging
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Fetch the API key from environment variables for security
API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not API_KEY:
    raise ValueError("OPENWEATHER_API_KEY is not set in environment variables.")

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def fetch_weather_data(self):
    """
    Fetch current weather data for all cities and store them in the WeatherData model.
    """
    cities = City.objects.all()
    for city in cities:
        if city.latitude and city.longitude:
            # Use latitude and longitude for more accurate data
            url = (
                f"https://api.openweathermap.org/data/2.5/weather?"
                f"lat={city.latitude}&lon={city.longitude}&appid={API_KEY}"
            )
        else:
            # Fallback to city name and country code
            url = (
                f"https://api.openweathermap.org/data/2.5/weather?"
                f"q={city.name},{city.country_code}&appid={API_KEY}"
            )

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Extract required fields with default values to prevent KeyError
            main_data = data.get('main', {})
            weather_list = data.get('weather', [])
            weather_main = weather_list[0].get('main') if weather_list else 'Unknown'
            temp_kelvin = main_data.get('temp')
            feels_like_kelvin = main_data.get('feels_like')
            # timestamp = datetime.fromtimestamp(data.get('dt', dj_timezone.now().timestamp()), dj_timezone.utc)
            timestamp_unix = data.get('dt', datetime.now(dt_timezone.utc).timestamp())

            # Validate temperature data
            if temp_kelvin is None or feels_like_kelvin is None:
                logger.error(f"Temperature data missing for {city.name}. Data: {data}")
                continue  # Skip this city and proceed to the next

            # Convert temperature from Kelvin to Celsius
            temp_celsius = temp_kelvin - 273.15
            feels_like_celsius = feels_like_kelvin - 273.15

            # Convert UNIX timestamp to timezone-aware datetime object
            timestamp = datetime.fromtimestamp(timestamp_unix, dt_timezone.utc)

            # Save to the database
            WeatherData.objects.update_or_create(
                city=city,
                timestamp=timestamp,
                defaults={
                    'main': weather_main,
                    'temp': temp_celsius,
                    'feels_like': feels_like_celsius,
                    'humidity': main_data.get('humidity'),
                    'wind_speed': data.get('wind', {}).get('speed')
                }
            )
            
            logger.info(f"Successfully fetched weather data for {city.name}")

            # After saving, check for alerts (Ensure 'check_alerts' is defined)
            check_alerts(city, temp_celsius, weather_main)

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error for {city.name}: {http_err}")
            if response.status_code >= 500:
                try:
                    self.retry(exc=http_err)
                except self.MaxRetriesExceededError:
                    logger.error(f"Max retries exceeded for {city.name}")
        except requests.exceptions.ConnectionError as conn_err:
            logger.error(f"Connection error for {city.name}: {conn_err}")
            try:
                self.retry(exc=conn_err)
            except self.MaxRetriesExceededError:
                logger.error(f"Max retries exceeded for {city.name}")
        except requests.exceptions.Timeout as timeout_err:
            logger.error(f"Timeout error for {city.name}: {timeout_err}")
            try:
                self.retry(exc=timeout_err)
            except self.MaxRetriesExceededError:
                logger.error(f"Max retries exceeded for {city.name}")
        except Exception as err:
            logger.error(f"Unexpected error for {city.name}: {err}")
            # Depending on the nature of the error, decide whether to retry or skip
            # For now, we'll skip to the next city
            continue
        
        

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def fetch_forecast_data(self):
    """
    Fetch today's forecast data for all cities and store them in the ForecastData model.
    """
    cities = City.objects.all()
    for city in cities:
        try:
            # Construct API URL based on available data
            if city.latitude and city.longitude:
                url = (
                    f"https://api.openweathermap.org/data/2.5/forecast?"
                    f"lat={city.latitude}&lon={city.longitude}&appid={API_KEY}"
                )
            else:
                # Fallback to city name and country code
                url = (
                    f"https://api.openweathermap.org/data/2.5/forecast?"
                    f"q={city.name},{city.country_code}&appid={API_KEY}"
                )

            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Extract required fields with default values to prevent KeyError
            list_data = data.get('list', [])
            city_info = data.get('city', {})
            if not list_data or not city_info:
                logger.error(f"Forecast data missing for {city.name}. Data: {data}")
                continue  # Skip this city and proceed to the next

            # Get the city's timezone offset in seconds
            city_timezone_offset = city_info.get('timezone', 0)
            city_timezone = dt_timezone(timedelta(seconds=city_timezone_offset))
            today_date = datetime.now(city_timezone).date()

            # Before saving new data, delete existing forecast data for today for this city
            ForecastData.objects.filter(city=city, timestamp__date=today_date).delete()

            for entry in list_data:
                main_data = entry.get('main', {})
                weather_list = entry.get('weather', [])
                weather_main = weather_list[0].get('main') if weather_list else 'Unknown'
                temp_kelvin = main_data.get('temp')
                feels_like_kelvin = main_data.get('feels_like')
                timestamp_unix = entry.get('dt', datetime.now(dt_timezone.utc).timestamp())

                # Validate temperature data
                if temp_kelvin is None or feels_like_kelvin is None:
                    logger.error(f"Temperature data missing in forecast for {city.name}. Entry: {entry}")
                    continue  # Skip this entry and proceed to the next

                # Convert temperature from Kelvin to Celsius
                temp_celsius = temp_kelvin - 273.15
                feels_like_celsius = feels_like_kelvin - 273.15

                # Convert UNIX timestamp to timezone-aware datetime object
                timestamp = datetime.fromtimestamp(timestamp_unix, dt_timezone.utc)

                # Adjust timestamp to city's timezone
                timestamp_in_city_tz = timestamp.astimezone(city_timezone)
                entry_date = timestamp_in_city_tz.date()

                if entry_date != today_date:
                    # Skip entries not for today
                    continue

                # Save to the database using update_or_create
                ForecastData.objects.update_or_create(
                    city=city,
                    timestamp=timestamp,
                    defaults={
                        'main': weather_main,
                        'temp': temp_celsius,
                        'feels_like': feels_like_celsius,
                        'humidity': main_data.get('humidity'),
                        'wind_speed': entry.get('wind', {}).get('speed'),
                        'description': weather_list[0].get('description', 'No description') if weather_list else 'No description',
                    }
                )

            logger.info(f"Successfully fetched today's forecast data for {city.name}")

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error for {city.name}: {http_err}")
            if response.status_code >= 500:
                self.retry(exc=http_err)
        except requests.exceptions.ConnectionError as conn_err:
            logger.error(f"Connection error for {city.name}: {conn_err}")
            self.retry(exc=conn_err)
        except requests.exceptions.Timeout as timeout_err:
            logger.error(f"Timeout error for {city.name}: {timeout_err}")
            self.retry(exc=timeout_err)
        except Exception as err:
            logger.error(f"Unexpected error for {city.name}: {err}")
            continue


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def aggregate_daily_summary(self, target_date=None):
    """
    Aggregate daily weather data for each city and store in DailySummary model.
    """
    try:
        if target_date:
            date_to_aggregate = datetime.strptime(target_date, "%Y-%m-%d").date()
        else:
            # Define the date range for the previous day
            today = dj_timezone.now().date()
            date_to_aggregate = today - timedelta(days=1)

        cities = City.objects.all()

        for city in cities:
            # Filter WeatherData for the city and the previous day
            daily_data = WeatherData.objects.filter(
                city=city,
                timestamp__date=date_to_aggregate
            )

            if not daily_data.exists():
                logger.warning(f"No weather data for {city.name} on {date_to_aggregate}. Skipping summary.")
                continue

            # Calculate summary statistics
            avg_temp = daily_data.aggregate(avg_temp=Avg('temp'))['avg_temp']
            max_temp = daily_data.aggregate(max_temp=Max('temp'))['max_temp']
            min_temp = daily_data.aggregate(min_temp=Min('temp'))['min_temp']
            avg_humidity = daily_data.aggregate(avg_humidity=Avg('humidity'))['avg_humidity']
            avg_wind_speed = daily_data.aggregate(avg_wind_speed=Avg('wind_speed'))['avg_wind_speed']
            
            
            # Determine the dominant weather condition
            weather_conditions = daily_data.values_list('main', flat=True)
            condition_counts = Counter(weather_conditions)
            dominant_condition, count = condition_counts.most_common(1)[0]
            dominant_reasoning = f"Most frequent condition: {dominant_condition} ({count} occurrences)"
            # Create or update DailySummary
            DailySummary.objects.update_or_create(
                city=city,
                date=date_to_aggregate,
                defaults={
                    'avg_temp': avg_temp,
                    'max_temp': max_temp,
                    'min_temp': min_temp,
                    'avg_humidity': avg_humidity,
                    'avg_wind_speed': avg_wind_speed,
                    'dominant_condition': dominant_condition,
                    'dominant_reasoning': dominant_reasoning,
                }
            )

            logger.info(f"Daily summary created for {city.name} on {date_to_aggregate}.")

    except Exception as e:
        logger.error(f"Error in aggregate_daily_summary task: {e}")
        try:
            self.retry(exc=e)
        except self.MaxRetriesExceededError:
            logger.error("Max retries exceeded for aggregate_daily_summary task.")


def check_alerts(city, current_temp, current_condition):
    """
    Check if the current weather data triggers any alerts based on thresholds.
    """
    try:
        thresholds = Threshold.objects.filter(city=city)
        for threshold in thresholds:
            alert_message = ""
            alert_needed = False

            # Temperature Threshold
            if threshold.temp_threshold is not None:
                if current_temp > threshold.temp_threshold:
                    alert_needed = True
                    alert_message += f"Temperature has exceeded {threshold.temp_threshold}°C. "

            # Condition Threshold
            if threshold.condition_threshold:
                if current_condition.lower() == threshold.condition_threshold.lower():
                    alert_needed = True
                    alert_message += f"Weather condition '{current_condition}' detected. "

            if alert_needed:
                # Check consecutive updates
                recent_weather = WeatherData.objects.filter(
                    city=city
                ).order_by('-timestamp')[:threshold.consecutive_updates]

                breach_count = 0
                for entry in recent_weather:
                    breach = False
                    if threshold.temp_threshold is not None and entry.temp > threshold.temp_threshold:
                        breach = True
                    if threshold.condition_threshold and entry.main.lower() == threshold.condition_threshold.lower():
                        breach = True
                    if breach:
                        breach_count += 1
                    else:
                        break

                if breach_count >= threshold.consecutive_updates:
                    # Check if an active alert already exists
                    existing_alert = Alert.objects.filter(
                        user=threshold.user,
                        city=city,
                        message=alert_message.strip(),
                        is_active=True
                    ).exists()

                    if not existing_alert:
                        # Trigger Alert
                        Alert.objects.create(
                            user=threshold.user,
                            city=city,
                            message=alert_message.strip()
                        )
                        logger.info(f"Alert created for {threshold.user.username} in {city.name}: {alert_message.strip()}")

                        # Try to send an email notification
                        try:
                            send_mail(
                                subject='Weather Alert',
                                message=alert_message.strip(),
                                from_email='noreply@weathermonitor.com',
                                recipient_list=[threshold.user.email],
                                fail_silently=False,
                            )
                            logger.info(f"Alert email sent to {threshold.user.email} for {city.name}")
                        except Exception as e:
                            logger.error(f"Error sending email to {threshold.user.email}: {e}")
                            # If email sending fails, print the alert message to the terminal
                            print(f"ALERT for {threshold.user.username} in {city.name}: {alert_message.strip()}")

    except Threshold.DoesNotExist:
        logger.warning(f"No thresholds set for {city.name}. Skipping alert checks.")
    except Exception as e:
        logger.error(f"Error while checking alerts for {city.name}: {e}")


                    

@shared_task
def cleanup_old_weather_data():
    """
    Delete WeatherData entries older than 30 days.
    """
    # Get the current time in UTC (timezone-aware)
    now_utc = dj_timezone.now()

    # Calculate the cutoff date 30 days ago in UTC
    cutoff_date = now_utc - timedelta(days=30)

    logger.info(f"Current UTC time: {now_utc}")
    logger.info(f"Cutoff date (UTC): {cutoff_date}")

    # Query using the correct timezone-aware cutoff date
    old_entries = WeatherData.objects.filter(timestamp__lt=cutoff_date)

    logger.info(f"Found {old_entries.count()} entries to delete.")

    count = old_entries.count()
    if count > 0:
        old_entries.delete()
        logger.info(f"Deleted {count} old WeatherData entries.")
    else:
        logger.info("No entries found to delete.")

@shared_task
def deactivate_old_alerts():
    """
    Deactivate alerts that have been active for more than the specified duration.
    """
    # Define the duration after which alerts should be deactivated (e.g., 24 hours)
    alert_active_duration = timedelta(hours=24)

    # Calculate the cutoff datetime
    cutoff_datetime = dj_timezone.now() - alert_active_duration

    # Fetch alerts that are still active and were created before the cutoff datetime
    alerts_to_deactivate = Alert.objects.filter(is_active=True, created_at__lt=cutoff_datetime)

    count = alerts_to_deactivate.count()
    if count > 0:
        alerts_to_deactivate.update(is_active=False)
        logger.info(f"Deactivated {count} alerts that were active for more than {alert_active_duration}.")
    else:
        logger.info("No alerts to deactivate at this time.")
        
