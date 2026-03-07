# backend/files/views.py

from rest_framework import viewsets, status, parsers  # Make sure parsers is imported
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
import os

from .models import UploadedFile
from .serializers import UploadedFileSerializer
from .analyzers import analyze_file
from pricing.calculator import PricingCalculator


@api_view(['POST'])
@permission_classes([AllowAny])
def public_file_upload(request):
    """
    Public file upload for guest quote requests
    No authentication required
    """
    from .serializers import UploadedFileSerializer
    from .analyzers import analyze_file
    
    serializer = UploadedFileSerializer(data=request.data)
    
    if serializer.is_valid():
        # Save without user (guest upload)
        uploaded_file = serializer.save(user=None)
        
        # Analyze file
        if uploaded_file.file and uploaded_file.file.path:
            file_path = uploaded_file.file.path
            file_ext = uploaded_file.original_filename.split('.')[-1].lower()
            
            try:
                analysis_result = analyze_file(file_path, f'.{file_ext}')
                
                uploaded_file.volume = analysis_result.get('volume')
                uploaded_file.surface_area = analysis_result.get('surface_area')
                uploaded_file.bounding_box_x = analysis_result.get('bounding_box_x')
                uploaded_file.bounding_box_y = analysis_result.get('bounding_box_y')
                uploaded_file.bounding_box_z = analysis_result.get('bounding_box_z')
                uploaded_file.weight = analysis_result.get('weight')
                uploaded_file.is_valid = analysis_result.get('is_valid', False)
                uploaded_file.validation_errors = analysis_result.get('validation_errors')
                uploaded_file.save(update_fields=[
                    'volume', 'surface_area', 'bounding_box_x', 'bounding_box_y',
                    'bounding_box_z', 'weight', 'is_valid', 'validation_errors'
                ])
            except Exception as e:
                uploaded_file.is_valid = False
                uploaded_file.validation_errors = str(e)
                uploaded_file.save(update_fields=['is_valid', 'validation_errors'])
        
        # Return serialized data
        return Response(
            UploadedFileSerializer(uploaded_file, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FileUploadViewSet(viewsets.ModelViewSet):
    serializer_class = UploadedFileSerializer
    permission_classes = [AllowAny] 
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['manufacturing_type', 'is_valid']
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            # Authenticated users see their own files
            return UploadedFile.objects.filter(user=self.request.user)
        else:
            # Guest users see no files (they can only upload)
            return UploadedFile.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            # Authenticated user - link to their account
            uploaded_file = serializer.save(user=self.request.user)
        else:
            # Guest user - no user association
            uploaded_file = serializer.save(user=None)
        
        # Analyze file after saving
        if uploaded_file.file and uploaded_file.file.path:
            file_path = uploaded_file.file.path
            file_ext = uploaded_file.original_filename.split('.')[-1].lower()
            
            try:
                analysis_result = analyze_file(file_path, f'.{file_ext}')
                
                # Update file with analysis results
                uploaded_file.volume = analysis_result.get('volume')
                uploaded_file.surface_area = analysis_result.get('surface_area')
                uploaded_file.bounding_box_x = analysis_result.get('bounding_box_x')
                uploaded_file.bounding_box_y = analysis_result.get('bounding_box_y')
                uploaded_file.bounding_box_z = analysis_result.get('bounding_box_z')
                uploaded_file.weight = analysis_result.get('weight')
                uploaded_file.is_valid = analysis_result.get('is_valid', False)
                uploaded_file.validation_errors = analysis_result.get('validation_errors')
                uploaded_file.save(update_fields=[
                    'volume', 'surface_area', 'bounding_box_x', 'bounding_box_y',
                    'bounding_box_z', 'weight', 'is_valid', 'validation_errors'
                ])
            except Exception as e:
                uploaded_file.is_valid = False
                uploaded_file.validation_errors = str(e)
                uploaded_file.save(update_fields=['is_valid', 'validation_errors'])
    
    @action(detail=True, methods=['post'], parser_classes=[parsers.JSONParser])  # ⚠️ Explicitly set parser
    def generate_quote(self, request, pk=None):
        """Generate automatic quote for uploaded file"""
        # Import inside function to avoid circular imports
        from quotes.models import Quote
        from quotes.serializers import QuoteSerializer
        
        uploaded_file = self.get_object()
        
        if not uploaded_file.is_valid:
            return Response(
                {'error': 'File analysis failed', 'details': uploaded_file.validation_errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get parameters from request - handle both JSON and form data
        material = request.data.get('material', 'PLA')
        quantity = int(request.data.get('quantity', 1))
        layer_height = float(request.data.get('layer_height', 0.2))
        infill_percentage = int(request.data.get('infill_percentage', 20))
        support_material = str(request.data.get('support_material', 'false')).lower() == 'true'
        
        # Calculate price based on manufacturing type
        if uploaded_file.manufacturing_type == '3D_PRINTING':
            price_breakdown = PricingCalculator.calculate_3d_printing_price(
                volume_cm3=uploaded_file.volume or 0,
                surface_area_cm2=uploaded_file.surface_area or 0,
                weight_grams=uploaded_file.weight or 0,
                bounding_box=(
                    uploaded_file.bounding_box_x or 0,
                    uploaded_file.bounding_box_y or 0,
                    uploaded_file.bounding_box_z or 0
                ),
                material=material,
                layer_height=layer_height,
                infill_percentage=infill_percentage,
                support_material=support_material
            )
        elif uploaded_file.manufacturing_type == 'CNC_MACHINING':
            price_breakdown = PricingCalculator.calculate_cnc_price(
                volume_cm3=uploaded_file.volume or 0,
                surface_area_cm2=uploaded_file.surface_area or 0,
                bounding_box=(
                    uploaded_file.bounding_box_x or 0,
                    uploaded_file.bounding_box_y or 0,
                    uploaded_file.bounding_box_z or 0
                ),
                material=material
            )
        elif uploaded_file.manufacturing_type == 'LASER_CUTTING':
            cut_length = ((uploaded_file.bounding_box_x or 0) + (uploaded_file.bounding_box_y or 0)) * 2 / 10
            price_breakdown = PricingCalculator.calculate_laser_cutting_price(
                surface_area_cm2=uploaded_file.surface_area or 0,
                bounding_box=(
                    uploaded_file.bounding_box_x or 0,
                    uploaded_file.bounding_box_y or 0,
                    uploaded_file.bounding_box_z or 0
                ),
                material=material,
                cut_length_cm=cut_length
            )
        else:
            return Response(
                {'error': 'Manufacturing type not supported for auto-quoting'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create quote
        quote = Quote.objects.create(
            user=request.user,
            uploaded_file=uploaded_file,
            manufacturing_type=uploaded_file.manufacturing_type,
            material=material,
            quantity=quantity,
            unit_price=price_breakdown['total_price'],
            total_price=price_breakdown['total_price'] * quantity,
            price_breakdown=price_breakdown,
        )
        
        serializer = QuoteSerializer(quote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)