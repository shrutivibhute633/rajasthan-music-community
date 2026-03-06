from rest_framework.permissions import BasePermission
from .models import AdminToken       

class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users or artists based on session.
    """
    def has_permission(self, request, view):
        return bool(request.session.get('is_authenticated', False))

class IsUser(BasePermission):
    """
    Allows access only to authenticated users with role 'user'.
    """
    def has_permission(self, request, view):
        return bool(
            request.session.get('is_authenticated', False) and
            request.session.get('role') == 'user'
        )

class IsArtist(BasePermission):
    """
    Allows access only to authenticated artists with role 'artist'.
    """
    def has_permission(self, request, view):
        return bool(
            request.session.get('is_authenticated', False) and
            request.session.get('role') == 'artist'
        )
        
class IsArtistForSite(BasePermission):
    """
    Allows access only to artists whose session site_id matches the requested pk.
    """
    def has_permission(self, request, view):
        # Check if user is an artist
        if not (request.session.get('is_authenticated', False) and request.session.get('role') == 'artist'):
            return False
        # Check if site_id in session matches the pk from the URL
        site_id = request.session.get('site_id')
        pk = view.kwargs.get('pk')  # Get pk from URL kwargs
        return site_id == int(pk) if site_id and pk else False
    
class IsAdmin(BasePermission):
    """
    Custom permission to check for a valid admin token in the Authorization header.
    """

    def has_permission(self, request, view):
        print(f"Request Headers: {request.headers}")  # Debugging line
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return False

        token = auth_header.split(' ', 1)[1]
        print(f"Token: {token}")  # Debugging line
        try:
            admin_token = AdminToken.objects.get(token=token)
            if admin_token.is_valid():
                print("Valid token found")
                return True
        except AdminToken.DoesNotExist:
            return False

        return False
    
    
class IsAdminOrArtistOrArtistForSite(BasePermission):
    """
    Allows access if user is admin OR artist OR artist for this site.
    """
    def has_permission(self, request, view):
        return (
            (IsAdmin().has_permission(request, view))
            or (IsArtist().has_permission(request, view)
            and IsArtistForSite().has_permission(request, view))
        )
