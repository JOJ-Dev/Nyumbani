from django.urls import path
from .views import (
    CreateStripePaymentIntent,
    StripeWebhook,
    ConfirmStripePayment,
    PaymentListView,
    PaymentDetailView,
    TenantPaymentSummaryView,
    PropertyPaymentSummaryView
)

urlpatterns = [
    path('create-payment-intent/', CreateStripePaymentIntent.as_view(), name='create_payment_intent'),
    path('stripe-webhook/', StripeWebhook.as_view(), name='stripe_webhook'),
    path('confirm-payment/', ConfirmStripePayment.as_view(), name='confirm_payment'),
    path('tenant-payment-summary/', TenantPaymentSummaryView.as_view(), name='tenant_payment_summary'),
    path('property-payment-summary/', PropertyPaymentSummaryView.as_view(), name='property_payment_summary'),
    path('', PaymentListView.as_view(), name='payment_list'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
]
