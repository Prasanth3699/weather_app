from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('weather.urls')),
    
    # JWT Authentication Endpoints
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Obtain JWT
    path('api/v1/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh JWT
]
