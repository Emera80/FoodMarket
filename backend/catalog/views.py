"""
catalog/views.py
----------------
Vues "Skinny" : chaque vue se limite à son rôle HTTP.
  1. Valider la requête / les données (serializers).
  2. Déléguer la logique métier au service approprié (services.py).
  3. Retourner la Response.
"""

import stripe
from rest_framework.views import APIView
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Restaurant, Plat, ContactMessage, Notification
from .serializers import (
    RestaurantSerializer, PlatSerializer, AvisSerializer,
    ContactMessageSerializer, NotificationSerializer,
)
from .services import (
    create_payment_intent,
    notify_admins_new_message,
    notify_client_reply,
)


# ─────────────────────────────────────────────
# PAIEMENT STRIPE
# ─────────────────────────────────────────────

class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            amount_cents = int(request.data.get('amount', 0))
            result = create_payment_intent(amount_cents, request.user.email)
            return Response(result)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            print(f"[STRIPE ERROR] {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# MESSAGES DE CONTACT
# ─────────────────────────────────────────────

class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'admin':
            return ContactMessage.objects.all()
        return ContactMessage.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        message = serializer.save(user=user)
        notify_admins_new_message(message)

    @action(detail=True, methods=['post'])
    def repondre(self, request, pk=None):
        message = self.get_object()
        message.reponse = request.data.get('reponse', '')
        message.est_lu = True
        message.save()
        notify_client_reply(message)
        return Response({'status': 'Réponse envoyée'})


# ─────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def marquer_lu(self, request, pk=None):
        notification = self.get_object()
        notification.est_lu = True
        notification.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def marquer_tout_lu(self, request):
        self.get_queryset().update(est_lu=True)
        return Response({'status': 'ok'})


# ─────────────────────────────────────────────
# RESTAURANTS
# ─────────────────────────────────────────────

class RestaurantViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and getattr(self.request.user, 'role', '') == 'admin':
            return Restaurant.objects.all()
        return Restaurant.objects.filter(is_active=True)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        cuisines = Restaurant.objects.values_list('type_cuisine', flat=True).distinct()
        return Response([c for c in cuisines if c])

    @action(detail=True, methods=['post'])
    def ajouter_avis(self, request, pk=None):
        restaurant = self.get_object()
        serializer = AvisSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, restaurant=restaurant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# PLATS
# ─────────────────────────────────────────────

class PlatViewSet(viewsets.ModelViewSet):
    serializer_class = PlatSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated and getattr(self.request.user, 'role', '') == 'admin':
            return Plat.objects.all()
        return Plat.objects.filter(is_available=True)

    @action(detail=False, methods=['get'])
    def top_ventes(self, request):
        # La requête complexe (annotate/order_by) est dans PlatManager.top_ventes()
        top_plats = Plat.objects.top_ventes(limit=4)
        serializer = self.get_serializer(top_plats, many=True)
        return Response(serializer.data)
