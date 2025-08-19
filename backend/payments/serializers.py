from rest_framework import serializers
from .models import Payment
from dashboard.models import Property

class PaymentSerializer(serializers.ModelSerializer):
    property_address = serializers.CharField(source='property_t.address', read_only=True)
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_email = serializers.CharField(source='tenant.user.email', read_only=True)
    monthly_rent = serializers.DecimalField(source='property_t.monthly_rent', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'tenant', 'property_t', 'property_address', 'tenant_name', 'tenant_email',
            'amount', 'currency', 'date', 'status', 'monthly_rent',
            'stripe_payment_intent_id', 'stripe_charge_id', 'stripe_receipt_url',
            'stripe_payment_method', 'stripe_failure_code', 'stripe_failure_message',
            'description', 'metadata', 'created_at', 'updated_at', 'formatted_amount',
            'is_successful'
        ]
        read_only_fields = (
            'date', 'created_at', 'updated_at', 'stripe_charge_id', 
            'stripe_receipt_url', 'stripe_failure_code', 'stripe_failure_message'
        )

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['amount', 'property_t', 'description']

class PaymentDetailSerializer(serializers.ModelSerializer):
    property_address = serializers.CharField(source='property_t.address', read_only=True)
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_email = serializers.CharField(source='tenant.user.email', read_only=True)
    monthly_rent = serializers.DecimalField(source='property_t.monthly_rent', max_digits=10, decimal_places=2, read_only=True)
    payment_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'tenant', 'property_t', 'property_address', 'tenant_name', 'tenant_email',
            'amount', 'currency', 'date', 'status', 'monthly_rent', 'payment_percentage',
            'stripe_payment_intent_id', 'stripe_charge_id', 'stripe_receipt_url',
            'stripe_payment_method', 'stripe_failure_code', 'stripe_failure_message',
            'description', 'metadata', 'created_at', 'updated_at', 'formatted_amount',
            'is_successful'
        ]
    
    def get_payment_percentage(self, obj):
        """Calculate what percentage of monthly rent this payment represents"""
        if obj.property_t.monthly_rent > 0:
            return round((obj.amount / obj.property_t.monthly_rent) * 100, 2)
        return 0

class TenantPaymentSummarySerializer(serializers.Serializer):
    total_payments = serializers.IntegerField()
    completed_payments = serializers.IntegerField()
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_payments = serializers.IntegerField()
    failed_payments = serializers.IntegerField()
    monthly_rent = serializers.DecimalField(max_digits=10, decimal_places=2)
    outstanding_balance = serializers.SerializerMethodField()
    
    def get_outstanding_balance(self, obj):
        """Calculate outstanding balance based on monthly rent"""
        monthly_rent = obj.get('monthly_rent', 0)
        total_paid = obj.get('total_paid', 0)
        return max(0, monthly_rent - total_paid)
