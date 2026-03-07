# backend/quotes/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class Quote(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
    ]
    
    MANUFACTURING_TYPES = [
        ('3D_PRINTING', '3D Printing'),
        ('CNC_MACHINING', 'CNC Machining'),
        ('LASER_CUTTING', 'Laser Cutting'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quote_number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='quotes')
    
    # Link to uploaded file
    uploaded_file = models.ForeignKey('files.UploadedFile', on_delete=models.CASCADE, related_name='quotes')
    
    # Manufacturing details
    manufacturing_type = models.CharField(max_length=20, choices=MANUFACTURING_TYPES)
    material = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=1)
    
    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    price_breakdown = models.JSONField(default=dict, blank=True)  # Stores detailed breakdown
    
    # Status & validity
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    valid_until = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-generate quote number if not set'
        now = timezone.now()
        if not self.quote_number:
            prefix = self.manufacturing_type[:3].upper()
            count = Quote.objects.filter(
                manufacturing_type=self.manufacturing_type,
                created_at__date=now.date()
            ).count() + 1
            self.quote_number = f"{prefix}-{now.strftime('%Y%m%d')}-{count:04d}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Quote {self.quote_number} - {self.user.username}"