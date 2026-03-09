# backend/quotes/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Quote
from .serializers import QuoteSerializer


class QuoteViewSet(viewsets.ModelViewSet):
    """
    Manage quotes - list, retrieve, accept, reject
    """
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'manufacturing_type', 'material']
    
    def get_queryset(self):
        return Quote.objects.filter(user=self.request.user).select_related('uploaded_file')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept quote and convert to order"""
        quote = self.get_object()
        
        if quote.status != 'PENDING':
            return Response(
                {'error': f'Quote cannot be accepted (current status: {quote.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quote.status = 'ACCEPTED'
        quote.save()
        
        from orders.models import Order, ProductionStage
        
        order = Order.objects.create(
            customer_name=request.user.get_full_name() or request.user.username,
            customer_email=request.user.email,
            customer_phone='',  # User should add this in profile
            customer_company='',
            user=request.user,  # ⚠️ LINK TO LOGGED-IN USER
            quote=quote,
            manufacturing_type=quote.manufacturing_type,
            material=quote.material,
            quantity=quote.quantity,
            unit_price=quote.unit_price,
            total_price=quote.total_price,
            status='CONFIRMED',  # Start from CONFIRMED
        )
        
        # Create default production stages
        stages_config = {
            '3D_PRINTING': ['FILE_CHECK', 'MATERIAL_PREP', 'SETUP', 'PRODUCTION', 'POST_PROCESS', 'QC', 'PACKING'],
            'CNC_MACHINING': ['FILE_CHECK', 'MATERIAL_PREP', 'SETUP', 'PRODUCTION', 'POST_PROCESS', 'QC', 'PACKING'],
            'LASER_CUTTING': ['FILE_CHECK', 'MATERIAL_PREP', 'SETUP', 'PRODUCTION', 'QC', 'PACKING'],
        }
        
        stage_list = stages_config.get(order.manufacturing_type, stages_config['3D_PRINTING'])
        
        for stage_name in stage_list:
            ProductionStage.objects.create(
                order=order,
                stage=stage_name,
                estimated_duration_hours=2 if stage_name == 'PRODUCTION' else 0.5
            )
        
        # Create initial update
        from orders.models import OrderUpdate
        OrderUpdate.objects.create(
            order=order,
            title="Pesanan Dikonfirmasi",
            message=f"Terima kasih! Pesanan {order.order_number} telah dikonfirmasi dan akan segera diproses.",
            update_type='PROGRESS'
        )
        
        return Response({
            'status': 'Quote accepted', 
            'quote_number': quote.quote_number,
            'order_number': order.order_number
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject quote"""
        quote = self.get_object()
        if quote.status != 'PENDING':
            return Response(
                {'error': f'Quote cannot be rejected (current status: {quote.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        quote.status = 'REJECTED'
        quote.save()
        return Response({'status': 'Quote rejected', 'quote_number': quote.quote_number})
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Generate and download quote as PDF"""
        # TODO: Implement PDF generation with ReportLab or WeasyPrint
        quote = self.get_object()
        return Response(
            {'message': 'PDF generation not implemented yet'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )