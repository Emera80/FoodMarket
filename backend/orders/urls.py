from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommandeViewSet, CommandeItemViewSet
from .views import GenererFacturePDFView, DeliveryFeeView

router = DefaultRouter()
router.register(r'commandes', CommandeViewSet, basename='commande')
router.register(r'commande-items', CommandeItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('delivery-fee/', DeliveryFeeView.as_view(), name='delivery_fee'),
    path('commandes/<int:commande_id>/facture/', GenererFacturePDFView.as_view(), name='generer_facture_pdf'),
]