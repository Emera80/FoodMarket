from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import RestaurantViewSet, PlatViewSet, ContactMessageViewSet, NotificationViewSet
from .views import (
    RestaurantViewSet, 
    PlatViewSet, 
    ContactMessageViewSet, 
    NotificationViewSet,
    CreatePaymentIntentView,
)

# Le routeur génère automatiquement les URLs pour l'API
router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'plats', PlatViewSet, basename='plat')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
]