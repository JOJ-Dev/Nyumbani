from rest_framework import serializers
from .models import Property, Tenant
from payments.models import Payment
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()

class PropertyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new properties"""
    
    class Meta:
        model = Property
        fields = ['id', 'address', 'monthly_rent', 'is_vacant']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        # Automatically set the landlord to the current user
        validated_data['landlord'] = self.context['request'].user
        return super().create(validated_data)

class PropertySerializer(serializers.ModelSerializer):
    """Basic property serializer for listing"""
    
    class Meta:
        model = Property
        fields = ['id', 'address', 'monthly_rent', 'is_vacant']

class PropertyListSerializer(serializers.ModelSerializer):
    """Serializer for listing properties with tenant information"""
    tenant_count = serializers.IntegerField(source='tenants.count', read_only=True)
    tenant_name = serializers.CharField(source='tenants.first.user.get_full_name', read_only=True, default=None)
    tenant_email = serializers.CharField(source='tenants.first.user.email', read_only=True, default=None)
    
    class Meta:
        model = Property
        fields = [
            'id', 'address', 'monthly_rent', 'is_vacant',
            'tenant_count', 'tenant_name', 'tenant_email'
        ]

class PaymentSerializer(serializers.ModelSerializer):
    formatted_amount = serializers.CharField(source='formatted_amount', read_only=True)
    is_successful = serializers.BooleanField(source='is_successful', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'date', 'status', 'formatted_amount', 'is_successful', 'stripe_payment_intent_id']

class TenantDashboardSerializer(serializers.Serializer):
    tenant_name = serializers.SerializerMethodField()
    monthly_rent = serializers.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    property_address = serializers.CharField(source='property.address', read_only=True)
    lease_start = serializers.DateField()
    lease_end = serializers.DateField()
    payment_history = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()
    
    def get_tenant_name(self, obj):
        return f"{obj.user.email}"
    
    def get_payment_history(self, obj):
        payments = obj.payments.filter(status='completed').order_by('-date')[:5]
        return PaymentSerializer(payments, many=True).data
    
    def get_outstanding_balance(self, obj):
        monthly_rent = obj.property.monthly_rent
        paid_amount = sum(p.amount for p in obj.payments.filter(status='completed'))
        return max(0, monthly_rent - paid_amount)

class LandlordDashboardSerializer(serializers.Serializer):
    landlord_name = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()
    recent_payments = serializers.SerializerMethodField()
    total_properties = serializers.SerializerMethodField()
    total_tenants = serializers.SerializerMethodField()
    total_monthly_income = serializers.SerializerMethodField()
    total_paid_this_month = serializers.SerializerMethodField()
    
    def get_landlord_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() if obj.first_name and obj.last_name else obj.email
    
    def get_properties(self, obj):
        try:
            from django.utils import timezone
            properties = obj.properties.all()
            
            current_month = timezone.now().month
            current_year = timezone.now().year
            
            return [{
                'id': prop.id,
                'address': prop.address,
                'monthly_rent': prop.monthly_rent,
                'paid_amount': self._get_paid_amount_for_property_current_month(prop, current_month, current_year),
                'total_paid_amount': self._get_paid_amount_for_property(prop),
                'tenant_count': prop.tenants.count(),
                'vacant': getattr(prop, 'is_vacant', False),
                'total_annual_rent': prop.monthly_rent * 12
            } for prop in properties]
        except Exception:
            return []
    
    def _get_paid_amount_for_property(self, property_obj):
        try:
            return sum(
                payment.amount 
                for tenant in property_obj.tenants.all() 
                for payment in tenant.payments.filter(status='completed')
            )
        except Exception:
            return 0
    
    def _get_paid_amount_for_property_current_month(self, property_obj, month, year):
        try:
            return sum(
                payment.amount 
                for tenant in property_obj.tenants.all() 
                for payment in tenant.payments.filter(
                    status='completed',
                    date__month=month,
                    date__year=year
                )
            )
        except Exception:
            return 0
    
    def get_recent_payments(self, obj):
        try:
            recent_payments = Payment.objects.filter(
                tenant__property__landlord=obj
            ).order_by('-date')[:5]
            
            return [{
                'id': payment.id,
                'date': payment.date,
                'property_address': payment.tenant.property.address if hasattr(payment.tenant, 'property') and payment.tenant.property else 'N/A',
                'tenant_name': self._get_tenant_name(payment.tenant),
                'amount': payment.amount,
                'status': payment.status,
                'formatted_amount': getattr(payment, 'formatted_amount', str(payment.amount))
            } for payment in recent_payments]
        except Exception:
            return []
    
    def _get_tenant_name(self, tenant):
        try:
            user = tenant.user
            return f"{user.first_name} {user.last_name}".strip() or user.email
        except Exception:
            return "Unknown"
    
    def get_total_properties(self, obj):
        try:
            return obj.properties.count()
        except Exception:
            return 0
    
    def get_total_tenants(self, obj):
        try:
            return sum(prop.tenants.count() for prop in obj.properties.all())
        except Exception:
            return 0
    
    def get_total_monthly_income(self, obj):
        try:
            return sum(prop.monthly_rent for prop in obj.properties.all())
        except Exception:
            return 0
    
    def get_total_paid_this_month(self, obj):
        try:
            from django.utils import timezone
            from django.db.models import Sum
            
            # Get current date with timezone awareness
            now = timezone.now()
            current_month = now.month
            current_year = now.year
            
            # Use Django ORM aggregation for better performance
            total_paid = Payment.objects.filter(
                tenant__property__landlord=obj,
                status='completed',
                date__month=current_month,
                date__year=current_year
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            return total_paid
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error calculating total_paid_this_month: {str(e)}")
            return 0
