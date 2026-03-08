# backend/accounts/views.py
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView 
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from .serializers import UserSerializer, ProfileSerializer, RegisterSerializer, LoginSerializer
from .models import Profile

class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create auth token
        token, _ = Token.objects.get_or_create(user=user)
        
        # Get user role
        try:
            profile = user.profile
            role = profile.role
        except Profile.DoesNotExist:
            role = 'CUSTOMER'
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'role': role,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

class LoginView(ObtainAuthToken):
    """User login endpoint with role information"""
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        
        # Get user role
        try:
            profile = user.profile
            role = profile.role
        except Profile.DoesNotExist:
            role = 'CUSTOMER'
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'role': role
        })

class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Delete user's auth token
            request.user.auth_token.delete()
        except:
            pass
        logout(request)
        return Response({'message': 'Logout successful'})

class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile

class UserProfileView(generics.RetrieveAPIView):
    """Get current user info with role"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user