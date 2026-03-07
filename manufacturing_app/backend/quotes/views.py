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
        """Accept quote and mark as accepted"""
        quote = self.get_object()
        if quote.status != 'PENDING':
            return Response(
                {'error': f'Quote cannot be accepted (current status: {quote.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        quote.status = 'ACCEPTED'
        quote.save()
        
        # TODO: Trigger order creation here
        # from orders.services import create_order_from_quote
        # create_order_from_quote(quote)
        
        return Response({'status': 'Quote accepted', 'quote_number': quote.quote_number})
    
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