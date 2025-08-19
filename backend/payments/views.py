import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .models import Payment
from .serializers import PaymentSerializer, PaymentDetailSerializer
from .services import StripePaymentService
from dashboard.models import Tenant, Property

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateStripePaymentIntent(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        amount = request.data.get('amount')
        property_id = request.data.get('property_id')
        
        try:
            tenant = request.user.tenant_profile
            property_obj = Property.objects.get(id=property_id)
        except AttributeError:
            return Response(
                {"error": "Tenant not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Convert amount to cents for Stripe
            amount_in_cents = int(float(amount) * 100)
            
            # Create payment intent with Stripe
            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='kes',
                metadata={
                    'tenant_id': str(tenant.id),
                    'tenant_name': str(tenant.user.get_full_name() or tenant.user.username),
                    'property_id': str(property_obj.id),
                    'property_address': str(property_obj.address)
                }
            )
            
            # Create payment record
            payment = Payment.objects.create(
                tenant=tenant,
                property=property_obj,
                amount=amount,
                stripe_payment_intent_id=intent.id,
                stripe_client_secret=intent.client_secret
            )
            
            return Response({
                "client_secret": intent.client_secret,
                "payment_id": payment.id,
                "payment_details": PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class StripeWebhook(APIView):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        
        try:
            if endpoint_secret:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, endpoint_secret
                )
            else:
                event = request.data
                
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            
            # Update payment record
            try:
                payment = Payment.objects.get(
                    stripe_payment_intent_id=payment_intent['id']
                )
                payment.status = 'completed'
                payment.stripe_charge_id = payment_intent['charges']['data'][0]['id'] if payment_intent['charges']['data'] else None
                payment.save()
            except Payment.DoesNotExist:
                pass
                
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            
            # Update payment record
            try:
                payment = Payment.objects.get(
                    stripe_payment_intent_id=payment_intent['id']
                )
                payment.status = 'failed'
                payment.save()
            except Payment.DoesNotExist:
                pass
        
        return Response({"status": "success"}, status=status.HTTP_200_OK)

class ConfirmStripePayment(APIView):
    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            
            # Retrieve payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == 'succeeded':
                payment.status = 'completed'
                payment.stripe_charge_id = intent['charges']['data'][0]['id'] if intent['charges']['data'] else None
                payment.save()
                return Response({
                    "status": "completed",
                    "payment_id": payment.id,
                    "payment_details": PaymentSerializer(payment).data
                })
            elif intent.status == 'requires_payment_method':
                payment.status = 'failed'
                payment.save()
                return Response({
                    "status": "failed",
                    "payment_id": payment.id
                })
            else:
                return Response({
                    "status": intent.status,
                    "payment_id": payment.id
                })
                
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class PaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            return Payment.objects.filter(tenant_id=tenant_id)
        return Payment.objects.none()

class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentDetailSerializer
    permission_classes = [IsAuthenticated]
    queryset = Payment.objects.all()
    lookup_field = 'pk'

class TenantPaymentSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            tenant = request.user.tenant_profile
            summary = StripePaymentService.get_tenant_payment_summary(tenant)
            return Response(summary)
        except AttributeError:
            return Response(
                {"error": "User is not a tenant"}, 
                status=403
            )

class PropertyPaymentSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, property_id):
        try:
            property_obj = Property.objects.get(id=property_id)
            summary = StripePaymentService.get_property_payment_summary(property_obj)
            return Response(summary)
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found"}, 
                status=404
            )
