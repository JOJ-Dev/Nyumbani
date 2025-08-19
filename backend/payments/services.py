import stripe
from django.conf import settings
from .models import Payment
from dashboard.models import Tenant, Property

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripePaymentService:
    """
    Service to handle Stripe payment data retrieval and synchronization
    """
    
    @staticmethod
    def get_payment_intent_details(payment_intent_id):
        """Retrieve detailed payment information from Stripe"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'id': intent.id,
                'amount': intent.amount / 100,  # Convert from cents
                'currency': intent.currency,
                'status': intent.status,
                'client_secret': intent.client_secret,
                'payment_method': intent.payment_method,
                'charges': intent.charges.data if intent.charges else [],
                'metadata': intent.metadata,
                'created': intent.created,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
    
    @staticmethod
    def get_payment_history_for_tenant(tenant):
        """Get all Stripe payments for a specific tenant"""
        payments = Payment.objects.filter(tenant=tenant).exclude(
            stripe_payment_intent_id__isnull=True
        )
        
        stripe_payments = []
        for payment in payments:
            try:
                stripe_data = StripePaymentService.get_payment_intent_details(
                    payment.stripe_payment_intent_id
                )
                stripe_payments.append({
                    'local_payment': payment,
                    'stripe_data': stripe_data
                })
            except Exception as e:
                # Log error but continue processing other payments
                print(f"Error fetching Stripe data for payment {payment.id}: {e}")
                continue
        
        return stripe_payments
    
    @staticmethod
    def sync_payment_with_stripe(payment):
        """Sync local payment record with Stripe data"""
        if not payment.stripe_payment_intent_id:
            return False
        
        try:
            stripe_data = StripePaymentService.get_payment_intent_details(
                payment.stripe_payment_intent_id
            )
            
            # Update payment with Stripe data
            payment.status = StripePaymentService._map_stripe_status(stripe_data['status'])
            payment.stripe_charge_id = stripe_data['charges'][0]['id'] if stripe_data['charges'] else None
            payment.stripe_receipt_url = stripe_data['charges'][0]['receipt_url'] if stripe_data['charges'] else None
            payment.save()
            
            return True
        except Exception as e:
            print(f"Error syncing payment {payment.id}: {e}")
            return False
    
    @staticmethod
    def _map_stripe_status(stripe_status):
        """Map Stripe payment intent status to our payment status"""
        status_mapping = {
            'succeeded': 'completed',
            'processing': 'processing',
            'requires_payment_method': 'pending',
            'requires_confirmation': 'pending',
            'requires_action': 'pending',
            'canceled': 'canceled',
            'payment_failed': 'failed',
        }
        return status_mapping.get(stripe_status, 'pending')
    
    @staticmethod
    def get_tenant_payment_summary(tenant):
        """Get payment summary for tenant dashboard"""
        from .serializers import PaymentSerializer
        
        payments = Payment.objects.filter(tenant=tenant)
        
        # Sync with Stripe for latest status
        for payment in payments:
            StripePaymentService.sync_payment_with_stripe(payment)
        
        completed_payments = payments.filter(status='completed')
        
        # Get tenant's current property and monthly rent
        current_property = tenant.property
        monthly_rent = current_property.monthly_rent if current_property else 0
        
        # Serialize the payment data
        recent_payments_serialized = PaymentSerializer(
            completed_payments.order_by('-created_at')[:5], 
            many=True
        ).data
        
        all_payments_serialized = PaymentSerializer(
            payments.order_by('-created_at'), 
            many=True
        ).data
        
        return {
            'total_payments': payments.count(),
            'completed_payments': completed_payments.count(),
            'total_paid': sum(p.amount for p in completed_payments),
            'pending_payments': payments.filter(status='pending').count(),
            'failed_payments': payments.filter(status='failed').count(),
            'monthly_rent': monthly_rent,
            'outstanding_balance': max(0, monthly_rent - sum(p.amount for p in completed_payments)),
            'recent_payments': recent_payments_serialized,
            'all_payments': all_payments_serialized
        }
    
    @staticmethod
    def get_property_payment_summary(property_obj):
        """Get payment summary for a specific property"""
        payments = Payment.objects.filter(property_t=property_obj)
        
        # Sync all payments with Stripe
        for payment in payments:
            StripePaymentService.sync_payment_with_stripe(payment)
        
        completed_payments = payments.filter(status='completed')
        
        return {
            'total_payments': payments.count(),
            'total_collected': sum(p.amount for p in completed_payments),
            'monthly_rent': property_obj.monthly_rent,
            'outstanding_balance': property_obj.monthly_rent - sum(p.amount for p in completed_payments),
            'recent_payments': completed_payments.order_by('-created_at')[:10]
        }
