# backend/files/serializers.py
from rest_framework import serializers
from .models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    analysis_status = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UploadedFile
        fields = [
            'id', 'original_filename', 'manufacturing_type',
            'volume', 'surface_area', 'bounding_box_x',
            'bounding_box_y', 'bounding_box_z', 'weight',
            'is_valid', 'validation_errors', 'uploaded_at',
            'analysis_status', 'file', 'file_url'
        ]
        read_only_fields = ['id', 'uploaded_at', 'analysis_status', 'user']
        extra_kwargs = {
            'file': {'write_only': True}
        }
    
    def get_analysis_status(self, obj):
        if obj.is_valid:
            return 'completed'
        elif obj.validation_errors:
            return 'failed'
        return 'pending'
    
    def get_file_url(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None