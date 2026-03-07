# backend/accounts/models.py
from django.db import models
from django.contrib.auth.models import User
import uuid

class Profile(models.Model):
    """Extended user profile for manufacturers"""
    
    USER_TYPES = [
        ('MANUFACTURER', 'Manufacturer'),
        ('CUSTOMER', 'Customer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='CUSTOMER')
    
    # Company info (for manufacturers)
    company_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Manufacturing capabilities
    capabilities = models.JSONField(default=list, blank=True)  # ['3D_PRINTING', 'CNC_MACHINING']
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.user_type}"