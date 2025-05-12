from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import LogoutAllView, LogoutView,PasswordResetRequestAPIView, OTPVerificationAPIView, PasswordResetAPIView
from django.urls import path



urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('logout_all/', LogoutAllView.as_view(), name='auth_logout_all'),
    path("password-reset/request/", PasswordResetRequestAPIView.as_view(), name="password-reset-request"),
    path("password-reset/verify-otp/", OTPVerificationAPIView.as_view(), name="password-reset-verify-otp"),  # New API
    path("password-reset/change-password/", PasswordResetAPIView.as_view(), name="password-reset-change"),
]