# backend/orders/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta

from .models import Order, ProductionStage, OrderUpdate
from .serializers import (
    OrderSerializer, ProductionStageSerializer, 
    OrderUpdateSerializer, GuestQuoteRequestSerializer
)
from quotes.models import Quote


class OrderViewSet(viewsets.ModelViewSet):
    """Manage orders - for authenticated users and admins"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'manufacturing_type', 'customer_email']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Admin sees all orders
            return Order.objects.all().prefetch_related('stages', 'updates')
        # Customer sees only their orders
        return Order.objects.filter(
            models.Q(user=user) | models.Q(customer_email=user.email)
        ).prefetch_related('stages', 'updates')
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        """Admin: Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Status tidak valid'}, status=400)
        
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Auto-create production stages when status changes to IN_PRODUCTION
        if new_status == 'IN_PRODUCTION' and not order.stages.exists():
            self._create_default_stages(order)
        
        # Create update notification for customer
        if new_status != old_status:
            OrderUpdate.objects.create(
                order=order,
                title=f"Status diperbarui: {order.get_status_display()}",
                message=f"Pesanan {order.order_number} telah diperbarui dari '{old_status}' ke '{new_status}'.",
                update_type='PROGRESS'
            )
        
        return Response(OrderSerializer(order).data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def add_stage_update(self, request, pk=None):
        """Admin: Add/update production stage"""
        order = self.get_object()
        stage_name = request.data.get('stage')
        stage_status = request.data.get('status', 'IN_PROGRESS')
        notes = request.data.get('notes', '')
        assigned_to = request.data.get('assigned_to', '')
        
        stage, created = ProductionStage.objects.get_or_create(
            order=order,
            stage=stage_name,
            defaults={'status': stage_status}
        )
        
        if not created:
            stage.status = stage_status
            stage.notes = notes
            stage.assigned_to = assigned_to
            if stage_status == 'IN_PROGRESS' and not stage.started_at:
                stage.started_at = timezone.now()
            elif stage_status == 'COMPLETED' and not stage.completed_at:
                stage.completed_at = timezone.now()
            stage.save()
        
        return Response(ProductionStageSerializer(stage).data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def add_update(self, request, pk=None):
        """Admin: Add customer-facing update"""
        order = self.get_object()
        
        update = OrderUpdate.objects.create(
            order=order,
            title=request.data.get('title'),
            message=request.data.get('message'),
            update_type=request.data.get('update_type', 'INFO'),
            is_internal=request.data.get('is_internal', False),
        )
        
        # TODO: Send email notification to customer
        # send_order_update_email(order, update)
        
        return Response(OrderUpdateSerializer(update).data)
    
    def _create_default_stages(self, order):
        """Create default production stages for new order"""
        stages_config = {
            '3D_PRINTING': ['FILE_CHECK', 'MATERIAL_PREP', 'SETUP', 'PRODUCTION', 'POST_PROCESS', 'QC', 'PACKING'],
            'CNC_MACHINING': ['FILE_CHECK', 'MATERIAL_PREP', 'SETUP', 'PRODUCTION', 'POST_PROCESS', 'QC', 'PACKING'],
            'LASER_CUTTING': ['FILE_CHECK', 'MATERIAL_PREP', 'SETUP', 'PRODUCTION', 'QC', 'PACKING'],
        }
        
        stage_list = stages_config.get(order.manufacturing_type, stages_config['3D_PRINTING'])
        
        for i, stage_name in enumerate(stage_list):
            ProductionStage.objects.create(
                order=order,
                stage=stage_name,
                estimated_duration_hours=2 if stage_name == 'PRODUCTION' else 0.5
            )
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get orders for current user"""
        queryset = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class GuestQuoteViewSet(viewsets.ViewSet):
    """Public endpoint for quote requests without authentication"""
    permission_classes = [permissions.AllowAny]
        
    def create(self, request):
        """Submit a quote request as guest"""
        serializer = GuestQuoteRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated = serializer.validated_data
        
        # Get uploaded file
        from files.models import UploadedFile
        try:
            uploaded_file = UploadedFile.objects.get(id=validated['file_id'])
        except UploadedFile.DoesNotExist:
            return Response({'file_id': 'File tidak ditemukan'}, status=400)
        
        # ⚠️ CREATE QUOTE WITH user=None FOR GUESTS
        quote = Quote.objects.create(
            user=None,  # ⚠️ Guest order - no user
            uploaded_file=uploaded_file,
            manufacturing_type=validated['manufacturing_type'],
            material=validated['material'],
            quantity=validated['quantity'],
            unit_price=0,  # Will be calculated by admin
            total_price=0,
            status='PENDING',
        )
        
        # Create order
        order = Order.objects.create(
            customer_name=validated['name'],
            customer_email=validated['email'],
            customer_phone=validated['phone'],
            customer_company=validated.get('company', ''),
            quote=quote,
            manufacturing_type=validated['manufacturing_type'],
            material=validated['material'],
            quantity=validated['quantity'],
            unit_price=0,
            total_price=0,
            status='QUOTE_SENT',
            notes=validated.get('requirements', ''),
        )
        
        # Create initial update
        OrderUpdate.objects.create(
            order=order,
            title="Permintaan Penawaran Diterima",
            message=f"Terima kasih {validated['name']}! Tim kami akan menghubungi Anda via {validated['email']} atau {validated['phone']} dalam 1x24 jam untuk konfirmasi penawaran.",
            update_type='INFO'
        )
        
        return Response({
            'message': 'Permintaan penawaran berhasil dikirim!',
            'order_number': order.order_number,
            'next_steps': 'Tim kami akan menghubungi Anda segera untuk konfirmasi harga dan detail produksi.'
        }, status=status.HTTP_201_CREATED)