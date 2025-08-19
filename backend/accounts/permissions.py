from rest_framework import permissions

class IsTenant(permissions.BasePermission):
    """
    Custom permission to only allow tenants to access the view.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tenant

class IsNotLandlord(permissions.BasePermission):
    """
    Custom permission to prevent landlords from accessing the view.
    Allows tenants and other authenticated users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and not request.user.landlord
