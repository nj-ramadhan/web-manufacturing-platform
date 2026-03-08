# backend/accounts/models.py
from django.db import models
from django.contrib.auth.models import User
import uuid

class Profile(models.Model):
    """Extended user profile with role-based access control"""
    
    ROLE_CHOICES = [
        ('GUEST', 'Guest'),
        ('CUSTOMER', 'Customer'),
        ('ADMIN', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)
    
    # Role-based access
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    
    # Guest session tracking (for non-logged-in users)
    session_token = models.CharField(max_length=100, blank=True, unique=True, null=True)
    
    # Company info (for manufacturers/customers)
    company_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Manufacturing capabilities (for admin/manufacturers)
    capabilities = models.JSONField(default=list, blank=True)  # ['3D_PRINTING', 'CNC_MACHINING']
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Guest'} - {self.role}"
    
    @property
    def is_admin(self):
        return self.role == 'ADMIN' or (self.user and self.user.is_staff)
    
    @property
    def is_customer(self):
        return self.role == 'CUSTOMER' or (self.user and not self.user.is_staff)