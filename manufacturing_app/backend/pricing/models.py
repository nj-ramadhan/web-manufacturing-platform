from django.db import models
from django.conf import settings

class PricingModel(models.Model):
    """Pricing model for different manufacturing processes"""
    
    TECHNOLOGY_CHOICES = [
        ('3D_PRINTING', '3D Printing'),
        ('CNC_MACHINING', 'CNC Machining'),
        ('LASER_CUTTING', 'Laser Cutting'),
    ]
    
    name = models.CharField(max_length=100)
    technology = models.CharField(max_length=20, choices=TECHNOLOGY_CHOICES)
    material = models.CharField(max_length=100)
    
    # Pricing components
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_per_volume = models.DecimalField(max_digits=10, decimal_places=4, default=0)  # per cm³
    price_per_surface_area = models.DecimalField(max_digits=10, decimal_places=4, default=0)  # per cm²
    price_per_weight = models.DecimalField(max_digits=10, decimal_places=4, default=0)  # per gram
    setup_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Complexity factors
    complexity_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    minimum_price = models.DecimalField(max_digits=10, decimal_places=2, default=5.0)
    
    # Print settings impact
    layer_height_factor = models.DecimalField(max_digits=5, decimal_places=3, default=1.0)
    infill_factor = models.DecimalField(max_digits=5, decimal_places=3, default=1.0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['technology', 'material']
    
    def __str__(self):
        return f"{self.name} - {self.material}"