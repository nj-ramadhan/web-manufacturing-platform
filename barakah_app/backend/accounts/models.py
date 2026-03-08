# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('guest', 'Guest / Tamu'),
        ('customer', 'Customer / Pelanggan'),
        ('admin', 'Admin Barakah'),
    )

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest')
    is_verified_member = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"    
