from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # WeatherData Endpoints
    path('weather-data/latest/', views.weather_data_latest, name='weatherdata-latest'),  # Moved up
    path('weather-data/<int:pk>/', views.weather_data_detail, name='weatherdata-detail'),
    path('weather-data/', views.weather_data_list, name='weatherdata-list'),
    path('weather-data/latest/all/', views.latest_weather_all_cities, name='latest_weather_all_cities'),

    # City Endpoints
    path('cities/', views.city_list, name='city-list'),
    path('cities/<int:pk>/', views.city_detail, name='city-detail'),
    path('city/add/', views.add_city, name='add_city'),
    path('city/delete/<int:pk>/', views.delete_city, name='delete_city'),

    # DailySummary Endpoints
    path('daily-summaries/', views.daily_summary_list, name='dailysummary-list'),
    path('daily-summaries/<int:pk>/', views.daily_summary_detail, name='dailysummary-detail'),

    # Threshold Endpoints
    path('thresholds/', views.threshold_list_create, name='threshold-list-create'),
    path('thresholds/<int:pk>/', views.threshold_detail, name='threshold-detail'),

    # Alert Endpoints
    path('alerts/', views.alert_list, name='alert-list'),
    path('alerts/<int:pk>/', views.alert_detail, name='alert-detail'),

    # Registration Endpoint
    path('register/', views.register, name='register'),

    # User Preferences
    path('preferences/', views.user_preferences, name='user-preferences'),

    # Forecast Data
    path('forecast/', views.forecast_data_list, name='forecast-data-list'),
]
