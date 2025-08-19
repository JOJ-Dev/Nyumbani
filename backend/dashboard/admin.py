from django.contrib import admin
from .models import Tenant, Property

admin.site.register(Property)
admin.site.register(Tenant)