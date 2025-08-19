from django.urls import path
from .views import TenantDataView, LandlordDataView, PropertyCreateView, PropertyCountView, PropertyListView, BulkPropertyCreateView

urlpatterns = [
    path('auth/tenant_data', TenantDataView.as_view(), name='tenant-data'),
    path('auth/landlord', LandlordDataView.as_view(), name='landlord-data'),
    path('properties/create/', PropertyCreateView.as_view(), name='property-create'),
    path('properties/count/', PropertyCountView.as_view(), name='property-count'),
    path('properties/', PropertyListView.as_view(), name='property-list'),
    path('properties/bulk-create/', BulkPropertyCreateView.as_view(), name='property-bulk-create'),
    # Add other URLs as needed
]
