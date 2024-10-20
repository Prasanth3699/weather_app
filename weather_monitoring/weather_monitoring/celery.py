from celery import Celery
from celery.schedules import crontab
import os

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weather_monitoring.settings')

# Initialize a new Celery app with the name 'weather_monitoring'.
app = Celery('weather_monitoring')

# Configure the Celery app to use Django's settings with the prefix 'CELERY_'.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django app configs.
app.autodiscover_tasks()

# Define periodic tasks (beat schedule) for the Celery Beat Scheduler.
app.conf.beat_schedule = {
    # Task: Fetch weather data every 15 minutes
    'fetch-weather-data-every-15-minutes': {
        'task': 'weather.tasks.fetch_weather_data',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },

    # Task: Aggregate daily summaries at midnight (00:00)
    'aggregate-daily-summary-daily': {
        'task': 'weather.tasks.aggregate_daily_summary',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },

    # Task: Cleanup old weather data daily at 1 AM
    'cleanup-weather-data-daily': {
        'task': 'weather.tasks.cleanup_old_weather_data',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
    },

    # Task: Fetch forecast data every 3 hours (at the start of each 3-hour block)
    'fetch-forecast-data-every-3-hours': {
        'task': 'weather.tasks.fetch_forecast_data',
        'schedule': crontab(minute=0, hour='*/3'),  # Every 3 hours
    },

    # Task: Deactivate old alerts every hour on the hour
    'deactivate-old-alerts-every-hour': {
        'task': 'weather.tasks.deactivate_old_alerts',
        'schedule': crontab(minute=0, hour='*'),  # Every hour
    },
}
