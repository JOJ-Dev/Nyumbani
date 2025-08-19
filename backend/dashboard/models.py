from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Property(models.Model):
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    address = models.CharField(max_length=255)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    is_vacant = models.BooleanField(default=False)
    
    def __str__(self):
        return self.address

class Tenant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tenant_profile')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, related_name='tenants')
    lease_start = models.DateField()
    lease_end = models.DateField()
    
    def __str__(self):
        return self.user.get_full_name()

