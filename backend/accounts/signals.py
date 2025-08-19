from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from dashboard.models import Tenant
from datetime import datetime, timedelta

User = get_user_model()

@receiver(post_save, sender=User)
def create_tenant_profile(sender, instance, created, **kwargs):
    """
    Automatically create a tenant profile when a user registers as a tenant
    """
    if created and instance.tenant and not instance.landlord:
        # Create tenant profile without property assignment initially
        # Property will be assigned later through a separate process
        tenant = Tenant.objects.create(
            user=instance,
            lease_start=datetime.now().date(),
            lease_end=(datetime.now() + timedelta(days=365)).date(),  # Default 1 year lease
            property=None  # Will be assigned later
        )
        print(f"Tenant profile created for {instance.email}")
