from .models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from dashboard.models import Property, Tenant
from datetime import datetime, timedelta

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['landlord'] = user.landlord
        token['tenant'] = user.tenant
        return token

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'phone_number', 'landlord', 'tenant']
        extra_kwargs = {
            'password': {'write_only': True},
            'phone_number': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Ensure user selects either landlord or tenant, not both
        if attrs.get('landlord') and attrs.get('tenant'):
            raise serializers.ValidationError({"role": "User cannot be both landlord and tenant"})
        
        # Ensure at least one role is selected
        if not attrs.get('landlord') and not attrs.get('tenant'):
            raise serializers.ValidationError({"role": "User must be either landlord or tenant"})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data['phone_number'],
            landlord=validated_data['landlord'],
            tenant=validated_data['tenant']
        )
        return user

class TenantAssignmentSerializer(serializers.Serializer):
    property_id = serializers.IntegerField(required=True)
    lease_start = serializers.DateField(required=False)
    lease_end = serializers.DateField(required=False)
    
    def validate_property_id(self, value):
        try:
            property_obj = Property.objects.get(id=value)
            if not property_obj.is_vacant:
                raise serializers.ValidationError("This property is not available")
            return value
        except Property.DoesNotExist:
            raise serializers.ValidationError("Property does not exist")
    
    def create(self, validated_data):
        user = self.context['request'].user
        property_id = validated_data['property_id']
        lease_start = validated_data.get('lease_start', datetime.now().date())
        lease_end = validated_data.get('lease_end', (datetime.now() + timedelta(days=365)).date())
        
        # Get or create tenant profile
        tenant, created = Tenant.objects.get_or_create(
            user=user,
            defaults={
                'lease_start': lease_start,
                'lease_end': lease_end,
                'property_id': property_id
            }
        )
        
        if not created:
            tenant.property_id = property_id
            tenant.lease_start = lease_start
            tenant.lease_end = lease_end
            tenant.save()
        
        # Mark property as occupied
        property_obj = Property.objects.get(id=property_id)
        property_obj.is_vacant = False
        property_obj.save()
        
        return tenant

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'address', 'monthly_rent', 'is_vacant']
