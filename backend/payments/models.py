from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Payment(models.Model):
    PAYMENT_STATUS = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
        ('processing', 'Processing'),
        ('canceled', 'Canceled'),
    ]
    
    # Use string references to avoid circular imports
    tenant = models.ForeignKey('dashboard.Tenant', on_delete=models.CASCADE, related_name='payments')
    property_t = models.ForeignKey('dashboard.Property', on_delete=models.CASCADE, related_name='property_payments', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='kes')
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Stripe fields
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_client_secret = models.CharField(max_length=255, blank=True, null=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_receipt_url = models.URLField(blank=True, null=True)
    stripe_payment_method = models.CharField(max_length=50, blank=True, null=True)
    stripe_failure_code = models.CharField(max_length=100, blank=True, null=True)
    stripe_failure_message = models.TextField(blank=True, null=True)
    
    # Additional metadata
    description = models.CharField(max_length=255, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.amount} - {self.get_status_display()}"
    
    @property
    def formatted_amount(self):
        return f"{self.currency.upper()} {self.amount:,.2f}"
    
    @property
    def is_successful(self):
        return self.status == 'completed'
