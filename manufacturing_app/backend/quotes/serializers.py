# backend/quotes/serializers.py
from rest_framework import serializers
from pricing.utils import format_idr
from .models import Quote


class QuoteSerializer(serializers.ModelSerializer):
    price_breakdown = serializers.JSONField(read_only=True)
    total_price_formatted = serializers.SerializerMethodField()
    unit_price_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Quote
        fields = [
            'id', 'quote_number', 'manufacturing_type',
            'material', 'quantity', 'unit_price', 'total_price',
            'unit_price_formatted', 'total_price_formatted',
            'price_breakdown', 'status', 'valid_until',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'quote_number', 'created_at', 'updated_at']
    
    def get_total_price_formatted(self, obj):
        return format_idr(obj.total_price)
    
    def get_unit_price_formatted(self, obj):
        return format_idr(obj.unit_price)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Add formatted price breakdown
        if instance.price_breakdown:
            data['price_breakdown_formatted'] = {
                k: format_idr(v) if isinstance(v, (int, float)) and k.endswith('_cost') or k in ['setup_fee', 'subtotal', 'total_price'] else v
                for k, v in instance.price_breakdown.items()
            }
        
        return data