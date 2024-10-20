from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.timezone import now
from django.contrib.auth.models import User
from .tasks import fetch_weather_data, fetch_forecast_data, aggregate_daily_summary
from .models import (
    City, WeatherData, DailySummary, Threshold, Alert, UserPreference, ForecastData
)
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Avg, Max, Min, OuterRef, Subquery
from rest_framework.pagination import PageNumberPagination
from .serializers import (
    CitySerializer,
    WeatherDataSerializer,
    DailySummarySerializer,
    ThresholdSerializer,
    AlertSerializer,
    RegisterSerializer,
    UserPreferenceSerializer,
    ForecastDataSerializer,
)
import logging

logger = logging.getLogger('weather')

class NoPagination(PageNumberPagination):
    page_size = None
    
    
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    logger.debug(f"Received registration data: {request.data}")
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        logger.info(f"User registered successfully: {serializer.data['username']}")
        return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
    logger.warning(f"Registration failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# City Views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def city_list(request):
    try:
        cities = City.objects.all()
        serializer = CitySerializer(cities, many=True)
        logger.info(f"User {request.user.username} fetched city list.")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching city list: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_city(request):
    """
    Add a new city record.
    """
    serializer = CitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        fetch_weather_data.delay()
        fetch_forecast_data.delay()
        aggregate_daily_summary.delay()
        logger.info(f"City {serializer.data['name']} added successfully.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    logger.warning(f"Failed to add city: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_city(request, pk):
    """
    Delete a city record by ID.
    """
    try:
        city = City.objects.get(pk=pk)
        city.delete()
        logger.info(f"City with ID {pk} deleted successfully.")
        return Response({"message": "City deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except City.DoesNotExist:
        logger.warning(f"Attempted to delete non-existent city with ID {pk}.")
        return Response({"error": "City not found."}, status=status.HTTP_404_NOT_FOUND)
    
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def city_detail(request, pk):
    try:
        city = City.objects.get(pk=pk)
    except City.DoesNotExist:
        logger.warning(f"User {request.user.username} requested non-existent city with id {pk}.")
        return Response({"error": "City not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = CitySerializer(city)
    return Response(serializer.data, status=status.HTTP_200_OK)

# WeatherData Views

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weather_data_list(request):
    """
    List all weather data with pagination and optional filtering by city.
    """
    try:
        paginator = PageNumberPagination()
        paginator.page_size = 10
        city_id = request.query_params.get('city', None)
        if city_id:
            # Validate if the city exists
            if not City.objects.filter(id=city_id).exists():
                logger.warning(f"User {request.user.username} attempted to filter with non-existent city_id={city_id}")
                return Response({"error": "City not found."}, status=status.HTTP_404_NOT_FOUND)
            weather_data = WeatherData.objects.filter(city_id=city_id).order_by('-timestamp')
            logger.debug(f"Filtering weather data for city_id={city_id}")
        else:
            weather_data = WeatherData.objects.all().order_by('-timestamp')
            logger.debug("Fetching all weather data without city filter.")
        result_page = paginator.paginate_queryset(weather_data, request)
        serializer = WeatherDataSerializer(result_page, many=True)
        logger.info(f"User {request.user.username} fetched weather data list.")
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching weather data list: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weather_data_detail(request, pk):
    """
    Retrieve a specific weather data point by ID.
    """
    try:
        weather_data = WeatherData.objects.get(pk=pk)
    except WeatherData.DoesNotExist:
        logger.warning(f"User {request.user.username} requested non-existent weather data with id {pk}.")
        return Response({"error": "Weather data not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = WeatherDataSerializer(weather_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weather_data_latest(request):
    """
    Retrieve the latest weather data for a specific city.
    """
    city_id = request.query_params.get('city', None)
    if city_id is None:
        return Response({"error": "City ID not provided."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        weather = WeatherData.objects.filter(city_id=city_id).order_by('-timestamp').first()
        if weather is None:
            return Response({"error": "No weather data found for the specified city."}, status=status.HTTP_404_NOT_FOUND)
        serializer = WeatherDataSerializer(weather)
        logger.info(f"User {request.user.username} fetched latest weather data for city_id={city_id}.")
        return Response(serializer.data, status=status.HTTP_200_OK)  # Return as a single object
    except Exception as e:
        logger.error(f"Error fetching latest weather data for city_id={city_id}: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def latest_weather_all_cities(request):
    """
    Retrieve the latest weather data for all cities.
    """
    try:
        # Subquery to get the latest timestamp for each city
        latest_weather_subquery = WeatherData.objects.filter(
            city=OuterRef('city_id')
        ).order_by('-timestamp').values('id')[:1]

        # Fetch WeatherData objects that match the latest timestamp for each city
        latest_weathers = WeatherData.objects.filter(id__in=Subquery(latest_weather_subquery))

        serializer = WeatherDataSerializer(latest_weathers, many=True)
        logger.info(f"User {request.user.username} fetched latest weather data for all cities.")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching latest weather data for all cities: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# DailySummary Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def daily_summary_list(request):
    """
    List all daily summaries with optional filtering by city and pagination.
    """
    try:
        paginator = PageNumberPagination()
        paginator.page_size = 10  # Adjust as needed
        city_id = request.query_params.get('city', None)
        if city_id:
            # Validate if the city exists
            if not City.objects.filter(id=city_id).exists():
                logger.warning(
                    f"User {request.user.username} attempted to filter daily summaries with non-existent city_id={city_id}"
                )
                return Response({"error": "City not found."}, status=status.HTTP_404_NOT_FOUND)
            summaries = DailySummary.objects.filter(city_id=city_id).order_by('-date')
        else:
            summaries = DailySummary.objects.all().order_by('-date')
        result_page = paginator.paginate_queryset(summaries, request)
        serializer = DailySummarySerializer(result_page, many=True)
        logger.info(f"User {request.user.username} fetched daily summaries.")
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching daily summaries: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def daily_summary_detail(request, pk):
    """
    Retrieve a specific daily summary by ID.
    """
    try:
        summary = DailySummary.objects.get(pk=pk)
    except DailySummary.DoesNotExist:
        logger.warning(f"User {request.user.username} requested non-existent daily summary with id {pk}.")
        return Response({"error": "Daily summary not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = DailySummarySerializer(summary)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Threshold Views

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def threshold_list_create(request):
    """
    GET: List all thresholds for the authenticated user.
    POST: Create a new threshold.
    """
    if request.method == 'GET':
        try:
            thresholds = Threshold.objects.filter(user=request.user)
            serializer = ThresholdSerializer(thresholds, many=True)
            logger.info(f"User {request.user.username} fetched their thresholds.")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching thresholds for user {request.user.username}: {str(e)}", exc_info=True)
            return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        serializer = ThresholdSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            logger.info(f"User {request.user.username} created a new threshold.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"User {request.user.username} failed to create a threshold: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def threshold_detail(request, pk):
    """
    GET: Retrieve a specific threshold by ID.
    PUT: Update a specific threshold.
    DELETE: Delete a specific threshold.
    """
    try:
        threshold = Threshold.objects.get(pk=pk, user=request.user)
    except Threshold.DoesNotExist:
        logger.warning(f"User {request.user.username} requested non-existent threshold with id {pk}.")
        return Response({"error": "Threshold not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ThresholdSerializer(threshold)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = ThresholdSerializer(threshold, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.username} updated threshold with id {pk}.")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.warning(f"User {request.user.username} failed to update threshold with id {pk}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        threshold.delete()
        logger.info(f"User {request.user.username} deleted threshold with id {pk}.")
        return Response(status=status.HTTP_204_NO_CONTENT)


# Alert Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def alert_list(request):
    """
    List all alerts for the authenticated user, with optional filtering by city.
    Only fetches alerts created today or later.
    """
    try:
        city_id = request.query_params.get('city', None)
        today = now().date()  # Get the current date

        if city_id:
            # Validate if the city exists
            if not City.objects.filter(id=city_id).exists():
                logger.warning(
                    f"User {request.user.username} attempted to filter alerts with non-existent city_id={city_id}"
                )
                return Response({"error": "City not found."}, status=status.HTTP_404_NOT_FOUND)

            # Filter alerts by user, city, and from today onwards
            alerts = Alert.objects.filter(
                user=request.user, 
                city_id=city_id, 
                created_at__date__gte=today
            ).order_by('-created_at')
            logger.debug(f"Filtering alerts for user {request.user.username} and city_id={city_id}")
        else:
            # Fetch alerts for the user from today onwards
            alerts = Alert.objects.filter(
                user=request.user, 
                created_at__date__gte=today
            ).order_by('-created_at')
            logger.debug(f"Fetching all alerts for user {request.user.username}")

        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(alerts, request)
        serializer = AlertSerializer(result_page, many=True)

        logger.info(f"User {request.user.username} fetched their alerts.")
        return paginator.get_paginated_response(serializer.data)

    except Exception as e:
        logger.error(f"Error fetching alerts for user {request.user.username}: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def alert_detail(request, pk):
    """
    Retrieve a specific alert by ID.
    """
    try:
        alert = Alert.objects.get(pk=pk, user=request.user)
    except Alert.DoesNotExist:
        logger.warning(f"User {request.user.username} requested non-existent alert with id {pk}.")
        return Response({"error": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = AlertSerializer(alert)
    return Response(serializer.data, status=status.HTTP_200_OK)


# User Preference Views

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_preferences(request):
    preference, created = UserPreference.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        serializer = UserPreferenceSerializer(preference)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserPreferenceSerializer(preference, data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.username} updated their preferences.")
            return Response(serializer.data)
        logger.warning(f"User {request.user.username} failed to update preferences: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ForecastData Views

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def forecast_data_list(request):
    """
    List all forecast data from today onwards with optional filtering by city.
    """
    try:
        city_id = request.query_params.get('city', None)
        today = now().date()  # Get the current date

        if city_id:
            # Validate if the city exists
            if not City.objects.filter(id=city_id).exists():
                logger.warning(
                    f"User {request.user.username} attempted to filter forecasts with non-existent city_id={city_id}"
                )
                return Response({"error": "City not found."}, status=status.HTTP_404_NOT_FOUND)

            # Filter forecasts for the specified city and from today onwards
            forecasts = ForecastData.objects.filter(city_id=city_id, timestamp__date__gte=today).order_by('timestamp')
            logger.debug(f"Filtering forecast data for city_id={city_id} from today onwards.")
        else:
            # Fetch all forecasts from today onwards
            forecasts = ForecastData.objects.filter(timestamp__date__gte=today).order_by('timestamp')
            logger.debug("Fetching all forecast data from today onwards without city filter.")

        serializer = ForecastDataSerializer(forecasts, many=True)
        logger.info(f"User {request.user.username} fetched forecast data list.")
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching forecast data list: {str(e)}", exc_info=True)
        return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


