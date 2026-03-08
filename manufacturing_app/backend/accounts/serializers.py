# backend/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'role']
        read_only_fields = ['id', 'is_staff']
    
    def get_role(self, obj):
        try:
            profile = obj.profile
            return profile.role
        except Profile.DoesNotExist:
            return 'CUSTOMER'

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'role', 'company_name',
            'phone', 'address', 'city', 'country',
            'capabilities', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'role']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['GUEST', 'CUSTOMER', 'ADMIN'], default='CUSTOMER', write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'role']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists"})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
        # Only allow CUSTOMER role for self-registration (ADMIN must be set by superuser)
        if data.get('role') == 'ADMIN':
            raise serializers.ValidationError({"role": "Cannot register as Admin directly"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role', 'CUSTOMER')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Create profile with role
        Profile.objects.create(user=user, role=role)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)