from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('accounts.urls')),
    path('',include('dashboard.urls')),
    path('payments/', include('payments.urls')),
    # Redirect /api/payments/ to /payments/ for backward compatibility
    path('api/payments/', RedirectView.as_view(url='/payments/', permanent=True)),
]
