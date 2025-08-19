from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics
from .serializers import UserRegistrationSerializer, TenantAssignmentSerializer, PropertySerializer

from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from dashboard.models import Property, Tenant
from django.contrib.auth import get_user_model

User = get_user_model()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
            "message": "User registered successfully",
            "user_id": user.id,
            "role": "landlord" if user.landlord else "tenant"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            serializer = UserRegistrationSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=500
            )

class TenantAssignmentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Assign a tenant to a property"""
        if not request.user.tenant:
            return Response(
                {"error": "Only tenants can be assigned to properties"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = TenantAssignmentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            tenant = serializer.save()
            return Response({
                "message": "Tenant successfully assigned to property",
                "tenant_id": tenant.id,
                "property_address": tenant.property.address
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvailablePropertiesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all available properties for tenant assignment"""
        available_properties = Property.objects.filter(is_vacant=True)
        serializer = PropertySerializer(available_properties, many=True)
        return Response(serializer.data)

class TenantProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get tenant profile details"""
        try:
            tenant = request.user.tenant_profile
            return Response({
                "tenant_id": tenant.id,
                "property": tenant.property.address if tenant.property else None,
                "lease_start": tenant.lease_start,
                "lease_end": tenant.lease_end
            })
        except Tenant.DoesNotExist:
            return Response(
                {"error": "Tenant profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
