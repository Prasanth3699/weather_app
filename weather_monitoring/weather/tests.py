import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from .models import City, WeatherData, DailySummary, UserPreference, Threshold, Alert, ForecastData
from datetime import datetime, timedelta
import pytz

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user():
    user = User.objects.create_user(username="testuser", password="testpassword")
    return user

@pytest.fixture
def auth_client(create_user, api_client):
    client = api_client
    client.login(username="testuser", password="testpassword")
    return client

@pytest.fixture
def create_city():
    city = City.objects.create(name="Test City", country_code="IN", latitude=28.6139, longitude=77.2090)
    return city

@pytest.fixture
def create_weather_data(create_city):
    return WeatherData.objects.create(
        city=create_city,
        timestamp=datetime.now(pytz.UTC),
        main="Clear",
        temp=30.0,
        feels_like=32.0
    )

@pytest.fixture
def create_daily_summary(create_city):
    return DailySummary.objects.create(
        city=create_city,
        date=datetime.now().date(),
        avg_temp=28.0,
        max_temp=32.0,
        min_temp=25.0,
        avg_humidity=70.0,
        avg_wind_speed=5.0,
        dominant_condition="Sunny"
    )

@pytest.fixture
def create_forecast_data(create_city):
    return ForecastData.objects.create(
        city=create_city,
        timestamp=datetime.now(pytz.UTC) + timedelta(days=1),
        temp=29.0,
        feels_like=31.0,
        main="Cloudy",
        description="Partly cloudy"
    )

@pytest.fixture
def create_alert(create_user, create_city):
    return Alert.objects.create(
        user=create_user,
        city=create_city,
        message="Temperature threshold exceeded.",
        is_active=True
    )

@pytest.mark.django_db
def test_register_user(api_client):
    url = reverse('register')
    data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "password123",
        "password2": "password123",
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert "message" in response.data
    assert response.data["message"] == "User registered successfully."

@pytest.mark.django_db
def test_city_list(auth_client, create_city):
    url = reverse('city-list')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Test City"

@pytest.mark.django_db
def test_weather_data_list(auth_client, create_weather_data):
    url = reverse('weatherdata-list')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['main'] == "Clear"

@pytest.mark.django_db
def test_weather_data_detail(auth_client, create_weather_data):
    url = reverse('weatherdata-detail', args=[create_weather_data.id])
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['main'] == "Clear"

@pytest.mark.django_db
def test_daily_summary_list(auth_client, create_daily_summary):
    url = reverse('dailysummary-list')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['dominant_condition'] == "Sunny"

@pytest.mark.django_db
def test_threshold_creation(auth_client, create_city):
    url = reverse('threshold-list-create')
    data = {
        "city_id": create_city.id,
        "temp_threshold": 35.0,
        "condition_threshold": "Rain",
        "consecutive_updates": 2,
    }
    response = auth_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["temp_threshold"] == 35.0
    assert response.data["condition_threshold"] == "Rain"

@pytest.mark.django_db
def test_forecast_data_list(auth_client, create_forecast_data):
    url = reverse('forecast-data-list')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['main'] == "Cloudy"

@pytest.mark.django_db
def test_user_preferences(auth_client):
    url = reverse('user-preferences')
    data = {"temp_unit": "Fahrenheit"}
    response = auth_client.put(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["temp_unit"] == "Fahrenheit"

@pytest.mark.django_db
def test_alert_creation(auth_client, create_alert):
    url = reverse('alert-list')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['message'] == "Temperature threshold exceeded."

@pytest.mark.django_db
def test_alert_detail(auth_client, create_alert):
    url = reverse('alert-detail', args=[create_alert.id])
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == "Temperature threshold exceeded."

@pytest.mark.django_db
def test_delete_threshold(auth_client, create_city):
    threshold = Threshold.objects.create(
        user=auth_client.handler._force_user,
        city=create_city,
        temp_threshold=35.0,
        condition_threshold="Rain",
        consecutive_updates=2,
    )
    url = reverse('threshold-detail', args=[threshold.id])
    response = auth_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Threshold.objects.filter(id=threshold.id).exists()

@pytest.mark.django_db
def test_update_user_preferences(auth_client):
    url = reverse('user-preferences')
    data = {"temp_unit": "Celsius"}
    response = auth_client.put(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["temp_unit"] == "Celsius"

@pytest.mark.django_db
def test_create_city_unauthenticated(api_client):
    url = reverse('city-list')
    data = {
        "name": "New City",
        "country_code": "US",
        "latitude": 40.7128,
        "longitude": -74.0060
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_403_FORBIDDEN
