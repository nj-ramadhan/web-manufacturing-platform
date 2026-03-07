from django.db import models
from django.contrib.auth.models import User
import uuid
import os

def upload_to(instance, filename):
    ext = os.path.splitext(filename)[1]
    if instance.user:
        # Authenticated user - organize by user ID
        user_path = f'users/{instance.user.id}'
    else:
        # Guest upload - use 'guests' folder
        user_path = 'guests'
    return f'uploads/{user_path}/{uuid.uuid4()}{ext}'

class UploadedFile(models.Model):
    MANUFACTURING_TYPES = [
        ('3D_PRINTING', '3D Printing'),
        ('CNC_MACHINING', 'CNC Machining'),
        ('LASER_CUTTING', 'Laser Cutting'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_files')
    file = models.FileField(upload_to=upload_to)
    original_filename = models.CharField(max_length=255)
    manufacturing_type = models.CharField(max_length=20, choices=MANUFACTURING_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Analysis results
    volume = models.FloatField(null=True, blank=True)  # cm³
    surface_area = models.FloatField(null=True, blank=True)  # cm²
    bounding_box_x = models.FloatField(null=True, blank=True)  # mm
    bounding_box_y = models.FloatField(null=True, blank=True)
    bounding_box_z = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)  # grams
    is_valid = models.BooleanField(default=False)
    validation_errors = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.original_filename} - {self.user.username if self.user else 'Guest'}"