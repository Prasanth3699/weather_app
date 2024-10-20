from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

from .models import (
    City, DailySummary, Alert, UserPreference, 
    Threshold, WeatherData, ForecastData
)

### RegisterSerializer ###
class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Validates passwords and ensures unique usernames and emails.
    """
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]  # Validate password strength
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,  # Confirm password field
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        """Ensure both passwords match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        """Create a new user with the validated data."""
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        return user

### UserSerializer ###
class UserSerializer(serializers.ModelSerializer):
    """Serializer to represent user information."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

### CitySerializer ###
class CitySerializer(serializers.ModelSerializer):
    """Serializer for city details."""
    class Meta:
        model = City
        fields = ['id', 'name', 'country_code', 'latitude', 'longitude', 'altitude']

### WeatherDataSerializer ###
class WeatherDataSerializer(serializers.ModelSerializer):
    """
    Serializer for weather data.
    Includes city details using the `CitySerializer`.
    """
    city = CitySerializer(read_only=True)

    class Meta:
        model = WeatherData
        fields = [
            'id', 'city', 'timestamp', 'main', 'temp', 
            'feels_like', 'humidity', 'wind_speed'
        ]

### DailySummarySerializer ###
class DailySummarySerializer(serializers.ModelSerializer):
    """
    Serializer for daily summaries.
    Provides aggregated weather data for a city.
    """
    city = CitySerializer(read_only=True)

    class Meta:
        model = DailySummary
        fields = [
            'id', 'city', 'date', 'avg_temp', 'max_temp',
            'min_temp', 'avg_humidity', 'avg_wind_speed',
            'dominant_condition', 'dominant_reasoning'
        ]

### ThresholdSerializer ###
class ThresholdSerializer(serializers.ModelSerializer):
    """
    Serializer for weather thresholds.
    Allows users to define conditions for alerts.
    """
    city = CitySerializer(read_only=True)
    city_id = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), source='city', write_only=True
    )

    class Meta:
        model = Threshold
        fields = [
            'id', 'city', 'city_id', 'temp_threshold', 
            'condition_threshold', 'consecutive_updates'
        ]

### AlertSerializer ###
class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer for user alerts.
    Includes user and city details.
    """
    city = CitySerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Alert
        fields = ['id', 'user', 'city', 'created_at', 'message']

### ForecastDataSerializer ###
class ForecastDataSerializer(serializers.ModelSerializer):
    """
    Serializer for forecast data.
    Provides weather predictions for a city.
    """
    city = CitySerializer(read_only=True)

    class Meta:
        model = ForecastData
        fields = [
            'id', 'city', 'timestamp', 'temp', 
            'feels_like', 'humidity', 'wind_speed', 
            'main', 'description'
        ]

### UserPreferenceSerializer ###
class UserPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for user preferences.
    Stores temperature unit preferences.
    """
    class Meta:
        model = UserPreference
        fields = ['temp_unit']
