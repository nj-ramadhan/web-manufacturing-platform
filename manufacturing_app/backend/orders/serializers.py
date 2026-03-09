# backend/orders/serializers.py
from rest_framework import serializers
from .models import Order, ProductionStage, OrderUpdate
from pricing.utils import format_idr

class ProductionStageSerializer(serializers.ModelSerializer):
    stage_label = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductionStage
        fields = [
            'id', 'stage', 'stage_label', 'status', 'status_label',
            'started_at', 'completed_at', 'estimated_duration_hours',
            'actual_duration_hours', 'notes', 'assigned_to', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_stage_label(self, obj):
        labels = {
            'FILE_CHECK': 'Pemeriksaan File',
            'MATERIAL_PREP': 'Persiapan Material',
            'SETUP': 'Setup Mesin',
            'PRODUCTION': 'Proses Produksi',
            'POST_PROCESS': 'Finishing',
            'QC': 'Quality Control',
            'PACKING': 'Packing',
        }
        return labels.get(obj.stage, obj.stage)
    
    def get_status_label(self, obj):
        labels = {
            'PENDING': 'Menunggu',
            'IN_PROGRESS': 'Berjalan',
            'COMPLETED': 'Selesai',
            'SKIPPED': 'Dilewati',
        }
        return labels.get(obj.status, obj.status)


class OrderUpdateSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderUpdate
        fields = [
            'id', 'title', 'message', 'update_type', 'image',
            'is_internal', 'created_at', 'created_at_formatted'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.astimezone().strftime('%d %b %Y, %H:%M WIB')

class OrderSerializer(serializers.ModelSerializer):
    quote_info = serializers.SerializerMethodField()
    stages = ProductionStageSerializer(many=True, read_only=True)
    updates = serializers.SerializerMethodField()
    total_price_formatted = serializers.SerializerMethodField()
    unit_price_formatted = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email',
            'customer_phone', 'customer_company', 'manufacturing_type',
            'material', 'quantity', 'unit_price', 'total_price',
            'unit_price_formatted', 'total_price_formatted',
            'status', 'status_label', 'estimated_completion',
            'actual_completion', 'shipping_method', 'tracking_number',
            'notes', 'quote_info', 'stages', 'updates',
            'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']
    
    def get_quote_info(self, obj):
        if obj.quote and obj.quote.uploaded_file:
            file = obj.quote.uploaded_file
            file_url = file.file.url if file.file else None
            
            return {
                'file_name': file.original_filename,
                'volume': file.volume,
                'weight': file.weight,
                'dimensions': {
                    'x': file.bounding_box_x,
                    'y': file.bounding_box_y,
                    'z': file.bounding_box_z,
                },
                'file_url': file_url,  # Returns: /media/uploads/...
            }
        return None
    
    def get_updates(self, obj):
        # Only return non-internal updates for customer view
        request = self.context.get('request')
        is_admin = request and hasattr(request.user, 'is_staff') and request.user.is_staff
        
        queryset = obj.updates.filter(is_internal=False) if not is_admin else obj.updates.all()
        return OrderUpdateSerializer(queryset, many=True).data
    
    def get_total_price_formatted(self, obj):
        return format_idr(obj.total_price)
    
    def get_unit_price_formatted(self, obj):
        return format_idr(obj.unit_price)
    
    def get_progress_percentage(self, obj):
        stages = obj.stages.all()
        if not stages:
            return 0
        completed = stages.filter(status='COMPLETED').count()
        return int((completed / len(stages)) * 100)
    
    def get_status_label(self, obj):
        labels = {
            'QUOTE_SENT': 'Penawaran Dikirim',
            'ACCEPTED': 'Diterima Customer',
            'CONFIRMED': 'Dikonfirmasi',
            'IN_PRODUCTION': 'Sedang Diproduksi',
            'QC_CHECK': 'Quality Control',
            'PACKING': 'Packing',
            'SHIPPED': 'Telah Dikirim',
            'COMPLETED': 'Selesai',
            'CANCELLED': 'Dibatalkan',
        }
        return labels.get(obj.status, obj.status)


class GuestQuoteRequestSerializer(serializers.Serializer):
    """For public quote requests without login"""
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    company = serializers.CharField(max_length=255, required=False, allow_blank=True)
    
    manufacturing_type = serializers.ChoiceField(choices=Order.MANUFACTURING_TYPES)
    material = serializers.CharField(max_length=100)
    quantity = serializers.IntegerField(min_value=1)
    
    # File info (file itself uploaded separately)
    file_id = serializers.UUIDField()
    
    # Additional requirements
    requirements = serializers.CharField(required=False, allow_blank=True)
    deadline = serializers.DateField(required=False, allow_null=True)
    
    # Consent
    agree_to_terms = serializers.BooleanField(required=True)
    agree_to_contact = serializers.BooleanField(required=False, default=False)
    
    def validate(self, data):
        if not data.get('agree_to_terms'):
            raise serializers.ValidationError({'agree_to_terms': 'Anda harus menyetujui syarat & ketentuan'})
        return data