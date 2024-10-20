from django.db import models
from django.contrib.auth.models import User

### City Model ###
class City(models.Model):
    """
    Represents a city where weather data is collected.
    Stores the name, country code, and geographical details.
    """
    name = models.CharField(max_length=100, unique=True)
    country_code = models.CharField(max_length=4, default='IN')  # ISO 3166 country code
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    altitude = models.FloatField(null=True, blank=True)  # Altitude in meters

    def __str__(self):
        return f"{self.name}, {self.country_code}"

### WeatherData Model ###
class WeatherData(models.Model):
    """
    Represents weather data for a specific city at a specific timestamp.
    Stores temperature, humidity, wind speed, and general conditions.
    """
    city = models.ForeignKey('City', related_name='weather_data', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)  # Timestamp when data is recorded
    main = models.CharField(max_length=50)  # Weather condition (e.g., Clear, Rain)
    temp = models.FloatField()  # Temperature in Celsius
    feels_like = models.FloatField()  # Feels-like temperature in Celsius
    humidity = models.FloatField(null=True, blank=True)  # Humidity percentage
    wind_speed = models.FloatField(null=True, blank=True)  # Wind speed in km/h

    class Meta:
        unique_together = ('city', 'timestamp')  # Prevent duplicate entries

    def __str__(self):
        return f"{self.city.name} - {self.timestamp}"

### DailySummary Model ###
class DailySummary(models.Model):
    """
    Aggregates daily weather data for a specific city.
    Stores average, max, and min temperatures, humidity, and dominant weather condition.
    """
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    date = models.DateField()  # Date of the summary
    avg_temp = models.FloatField()  # Average temperature of the day
    max_temp = models.FloatField()  # Maximum temperature of the day
    min_temp = models.FloatField()  # Minimum temperature of the day
    avg_humidity = models.FloatField()  # Average humidity percentage
    avg_wind_speed = models.FloatField()  # Average wind speed in km/h
    dominant_condition = models.CharField(max_length=50, default='Unknown')  # Most frequent condition
    dominant_reasoning = models.CharField(max_length=255, default='')  # Reason for the condition

    class Meta:
        unique_together = ('city', 'date')  # Ensure only one summary per city per day

    def __str__(self):
        return f"Daily Summary for {self.city.name} on {self.date}"

### UserPreference Model ###
class UserPreference(models.Model):
    """
    Stores user preferences, such as temperature units (Celsius/Fahrenheit).
    Linked to the Django User model.
    """
    TEMPERATURE_UNITS = (
        ('Celsius', 'Celsius'),
        ('Fahrenheit', 'Fahrenheit'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # One preference per user
    temp_unit = models.CharField(max_length=10, choices=TEMPERATURE_UNITS, default='Celsius')

    def __str__(self):
        return f"{self.user.username} Preferences"

### Threshold Model ###
class Threshold(models.Model):
    """
    Represents user-defined thresholds for weather alerts.
    Includes temperature limits and specific weather conditions for notifications.
    """
    user = models.ForeignKey(User, related_name='thresholds', on_delete=models.CASCADE)
    city = models.ForeignKey(City, related_name='thresholds', on_delete=models.CASCADE)
    temp_threshold = models.FloatField(null=True, blank=True)  # Threshold temperature in Celsius
    condition_threshold = models.CharField(max_length=50, null=True, blank=True)  # Condition for alert (e.g., Rain)
    consecutive_updates = models.IntegerField(default=1)  # Consecutive breaches needed to trigger alert

    def __str__(self):
        return f"Threshold for {self.user.username} in {self.city.name}"

### Alert Model ###
class Alert(models.Model):
    """
    Stores alerts triggered based on user thresholds.
    Contains alert messages, timestamps, and active status.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)  # Alert message content
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when alert was created
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp when alert was last updated
    is_active = models.BooleanField(default=True)  # Whether the alert is active or resolved

    def __str__(self):
        return f"Alert for {self.user.username} in {self.city.name} at {self.created_at}"

### ForecastData Model ###
class ForecastData(models.Model):
    """
    Stores forecast data for a specific city at a future timestamp.
    Includes weather condition, temperature, and humidity forecasts.
    """
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()  # Forecasted timestamp
    temp = models.FloatField()  # Forecasted temperature in Celsius
    feels_like = models.FloatField()  # Forecasted feels-like temperature in Celsius
    humidity = models.FloatField(null=True, blank=True)  # Forecasted humidity percentage
    wind_speed = models.FloatField(null=True, blank=True)  # Forecasted wind speed in km/h
    main = models.CharField(max_length=50)  # Forecasted main weather condition (e.g., Clear, Rain)
    description = models.CharField(max_length=255)  # Detailed weather description

    class Meta:
        unique_together = ('city', 'timestamp')  # Prevent duplicate forecasts for the same timestamp

    def __str__(self):
        return f"Forecast for {self.city.name} at {self.timestamp}"
