from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import RestaurantViewSet, PlatViewSet, ContactMessageViewSet, NotificationViewSet
from .views import (
    RestaurantViewSet, 
    PlatViewSet, 
    ContactMessageViewSet, 
    NotificationViewSet
)

# Le routeur génère automatiquement les URLs pour l'API
router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet)
router.register(r'plats', PlatViewSet)
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]