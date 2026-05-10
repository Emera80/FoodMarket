from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommandeViewSet, CommandeItemViewSet

router = DefaultRouter()
router.register(r'commandes', CommandeViewSet)
router.register(r'commande-items', CommandeItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]