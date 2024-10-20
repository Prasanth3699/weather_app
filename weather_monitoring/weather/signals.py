from celery.signals import worker_ready
import os
import logging
import redis

logger = logging.getLogger(__name__)

@worker_ready.connect
def at_start(sender, **kwargs):
    """
    Signal handler that triggers when the Celery worker is ready.
    """
    from weather.tasks import fetch_weather_data, fetch_forecast_data  # Import inside the handler to avoid circular imports

    # Check if startup triggers are enabled via environment variable
    trigger_on_startup = os.getenv('CELERY_TRIGGER_ON_STARTUP', 'False').lower() == 'true'

    if trigger_on_startup:
        try:
            # Initialize Redis client (ensure Redis is running and accessible)
            redis_client = redis.Redis(host='localhost', port=6379, db=0)
            lock = redis_client.lock("fetch_tasks_lock", timeout=300)  # 5-minute timeout

            acquired = lock.acquire(blocking=False)
            if acquired:
                try:
                    logger.info("Celery worker is ready. Triggering fetch_weather_data and fetch_forecast_data tasks.")
                    fetch_weather_data.delay()
                    fetch_forecast_data.delay()
                finally:
                    lock.release()
            else:
                logger.info("Another worker has already triggered fetch_weather_data and fetch_forecast_data tasks.")
        except Exception as e:
            logger.error(f"Error acquiring lock for task triggering: {e}")
            # Fallback to triggering without lock
            fetch_weather_data.delay()
            fetch_forecast_data.delay()
    else:
        logger.info("Celery worker is ready. Startup task triggering is disabled.")
