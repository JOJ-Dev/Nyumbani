from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.contrib.auth import get_user_model
from .serializers import TenantDashboardSerializer, LandlordDashboardSerializer, PropertyCreateSerializer, PropertyListSerializer
from .models import Property
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class TenantDataView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            tenant = request.user.tenant_profile
            serializer = TenantDashboardSerializer(tenant)
            return Response(serializer.data)
        except AttributeError:
            return Response(
                {"error": "User is not a tenant"}, 
                status=403
            )

class LandlordDataView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get the authenticated user (landlord)
            landlord = request.user
            
            # Check if user has landlord role
            if not hasattr(landlord, 'landlord') or not landlord.landlord:
                return Response(
                    {"success": False, "error": "User is not a landlord"}, 
                    status=403
                )
            
            serializer = LandlordDashboardSerializer(landlord)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except ObjectDoesNotExist as e:
            return Response(
                {"success": False, "error": "Related data not found"}, 
                status=404
            )
        except Exception as e:
            # Log the actual error for debugging
            logger.error(f"Error in LandlordDataView: {str(e)}")
            return Response(
                {"success": False, "error": "Internal server error"}, 
                status=500
            )

class PropertyCreateView(generics.CreateAPIView):
    """Create new properties for landlords"""
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyCreateSerializer
    
    def perform_create(self, serializer):
        # Automatically set the landlord to the current user
        serializer.save(landlord=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                property_obj = self.perform_create(serializer)
                return Response({
                    'success': True,
                    'message': 'Property created successfully',
                    'property': serializer.data
                }, status=201)
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=400)
        except Exception as e:
            logger.error(f"Error creating property: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create property'
            }, status=500)

class PropertyCountView(APIView):
    """Check if landlord has any properties"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            property_count = request.user.properties.count()
            return Response({
                'has_properties': property_count > 0,
                'property_count': property_count
            })
        except Exception as e:
            logger.error(f"Error getting property count: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=500
            )

class PropertyListView(APIView):
    """Get all properties for the authenticated landlord with tenant information"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            properties = request.user.properties.all().order_by('-id')
            serializer = PropertyListSerializer(properties, many=True)
            return Response({
                'success': True,
                'properties': serializer.data
            })
        except Exception as e:
            logger.error(f"Error getting properties: {str(e)}")
            return Response(
                {"success": False, "error": str(e)}, 
                status=500
            )

class BulkPropertyCreateView(APIView):
    """Create multiple properties at once for landlords"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            properties_data = request.data.get('properties', [])
            if not properties_data:
                return Response({
                    'success': False,
                    'error': 'No properties provided'
                }, status=400)
            
            created_properties = []
            errors = []
            
            for index, property_data in enumerate(properties_data):
                try:
                    # Ensure landlord is set
                    property_data['landlord'] = request.user.id
                    serializer = PropertyCreateSerializer(data=property_data)
                    if serializer.is_valid():
                        property_obj = serializer.save(landlord=request.user)
                        created_properties.append(serializer.data)
                    else:
                        errors.append({
                            'index': index,
                            'data': property_data,
                            'errors': serializer.errors
                        })
                except Exception as e:
                    errors.append({
                        'index': index,
                        'data': property_data,
                        'error': str(e)
                    })
            
            # Always return 201 for successful creation, even with partial success
            return Response({
                'success': len(errors) == 0,
                'message': f'Created {len(created_properties)} properties',
                'created_properties': created_properties,
                'errors': errors,
                'total_created': len(created_properties),
                'total_errors': len(errors)
            }, status=201)
            
        except Exception as e:
            logger.error(f"Error in bulk property creation: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create properties'
            }, status=500)

