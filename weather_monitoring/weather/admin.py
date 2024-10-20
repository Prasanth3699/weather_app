from django.contrib import admin
from .models import City, WeatherData, ForecastData, DailySummary, Threshold, Alert, UserPreference

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_code', 'latitude', 'longitude', 'altitude')
    search_fields = ('name', 'country_code')

@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ('city', 'timestamp', 'main', 'temp', 'feels_like', 'humidity', 'wind_speed')
    search_fields = ('city__name', 'main')

@admin.register(ForecastData)
class ForecastDataAdmin(admin.ModelAdmin):
    list_display = ('city', 'timestamp', 'main', 'temp', 'feels_like', 'humidity', 'wind_speed', 'description')
    search_fields = ('city__name', 'main')

@admin.register(DailySummary)
class DailySummaryAdmin(admin.ModelAdmin):
    list_display = ('city', 'date', 'avg_temp', 'max_temp', 'min_temp', 'avg_humidity')
    search_fields = ('city__name', 'avg_humidity')

@admin.register(Threshold)
class ThresholdAdmin(admin.ModelAdmin):
    list_display = ('city', 'temp_threshold', 'condition_threshold', 'consecutive_updates')
    search_fields = ('city__name',)

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'city',  'message')
    search_fields = ('user__username', 'city__name', 'message')

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'temp_unit')
    search_fields = ('user__username',)
