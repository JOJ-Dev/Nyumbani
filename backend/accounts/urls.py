from django.urls import path
from .views import (
    UserRegistrationView,
    MyTokenObtainPairView,
    UserInfoView,
    TenantAssignmentView,
    AvailablePropertiesView,
    TenantProfileView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),
    path('assign-tenant/', TenantAssignmentView.as_view(), name='assign-tenant'),
    path('available-properties/', AvailablePropertiesView.as_view(), name='available-properties'),
    path('tenant-profile/', TenantProfileView.as_view(), name='tenant-profile'),
]
