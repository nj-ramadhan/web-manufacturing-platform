# backend/orders/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from quotes.models import Quote
import uuid

class Order(models.Model):
    STATUS_CHOICES = [
        ('QUOTE_SENT', 'Penawaran Dikirim'),
        ('ACCEPTED', 'Diterima Customer'),
        ('CONFIRMED', 'Dikonfirmasi Admin'),
        ('IN_PRODUCTION', 'Sedang Diproduksi'),
        ('QC_CHECK', 'Quality Control'),
        ('PACKING', 'Packing & Pengiriman'),
        ('SHIPPED', 'Telah Dikirim'),
        ('COMPLETED', 'Selesai'),
        ('CANCELLED', 'Dibatalkan'),
    ]
    
    MANUFACTURING_TYPES = [
        ('3D_PRINTING', 'Cetak 3D'),
        ('CNC_MACHINING', 'CNC Machining'),
        ('LASER_CUTTING', 'Laser Cutting'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    
    # Customer info (for guest orders)
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField(blank=True)
    customer_company = models.CharField(max_length=255, blank=True)
    
    # Link to user if registered
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')
    
    # Order details
    quote = models.ForeignKey(Quote, on_delete=models.PROTECT)
    manufacturing_type = models.CharField(max_length=20, choices=MANUFACTURING_TYPES)
    material = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    
    # Pricing
    unit_price = models.DecimalField(max_digits=12, decimal_places=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=0)
    
    # Production tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUOTE_SENT')
    estimated_completion = models.DateField(null=True, blank=True)
    actual_completion = models.DateField(null=True, blank=True)
    
    # Shipping
    shipping_method = models.CharField(max_length=100, blank=True)
    shipping_address = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            prefix = self.manufacturing_type[:3].upper()
            count = Order.objects.filter(
                manufacturing_type=self.manufacturing_type,
                created_at__date=timezone.now().date()
            ).count() + 1
            self.order_number = f"ORD-{prefix}-{timezone.now().strftime('%Y%m%d')}-{count:04d}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.order_number} - {self.customer_name}"


class ProductionStage(models.Model):
    """Track detailed manufacturing progress"""
    
    STAGE_CHOICES = [
        ('FILE_CHECK', 'Pemeriksaan File'),
        ('MATERIAL_PREP', 'Persiapan Material'),
        ('SETUP', 'Setup Mesin'),
        ('PRODUCTION', 'Proses Produksi'),
        ('POST_PROCESS', 'Finishing'),
        ('QC', 'Quality Control'),
        ('PACKING', 'Packing'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='stages')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    
    status = models.CharField(
        max_length=20,
        choices=[('PENDING', 'Menunggu'), ('IN_PROGRESS', 'Berjalan'), ('COMPLETED', 'Selesai'), ('SKIPPED', 'Dilewati')],
        default='PENDING'
    )
    
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_duration_hours = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    actual_duration_hours = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    
    notes = models.TextField(blank=True)
    assigned_to = models.CharField(max_length=100, blank=True)  # Staff name
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.get_stage_display()}"


class OrderUpdate(models.Model):
    """Customer-facing progress updates"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='updates')
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    update_type = models.CharField(
        max_length=20,
        choices=[
            ('INFO', 'Informasi'),
            ('PROGRESS', 'Progress'),
            ('DELAY', 'Keterlambatan'),
            ('COMPLETED', 'Selesai'),
            ('ACTION_REQUIRED', 'Perlu Aksi'),
        ],
        default='INFO'
    )
    
    # Optional: attach images of production progress
    image = models.ImageField(upload_to='order_updates/', null=True, blank=True)
    
    is_internal = models.BooleanField(default=False)  # Hide from customer if True
    notified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.title}"