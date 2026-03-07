# backend/manufacturing_app/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from files.views import FileUploadViewSet, public_file_upload
from quotes.views import QuoteViewSet
from orders.views import OrderViewSet, GuestQuoteViewSet

router = DefaultRouter()
router.register(r'files', FileUploadViewSet, basename='file')
router.register(r'quotes', QuoteViewSet, basename='quote')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'guest-quotes', GuestQuoteViewSet, basename='guest-quote')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('accounts.urls')),
    path('api/public-upload/', public_file_upload, name='public-upload'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)