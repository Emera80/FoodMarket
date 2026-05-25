"""
orders/views.py
---------------
Vues "Skinny" : rôle strictement HTTP.
La logique de notification est déléguée à orders/services.py.
Le filtrage ORM est délégué à CommandeManager (orders/models.py).
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Commande, CommandeItem
from .serializers import CommandeSerializer, CommandeItemSerializer
from .services import notify_new_order, notify_status_change


class CommandeViewSet(viewsets.ModelViewSet):
    serializer_class   = CommandeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Commande.objects.none()

        if getattr(user, 'role', None) == 'admin':
            user_id = self.request.query_params.get('user')
            return Commande.objects.for_admin(user_id=user_id)

        return Commande.objects.for_user(user)

    def perform_create(self, serializer):
        commande = serializer.save(user=self.request.user)
        notify_new_order(commande, self.request.user)

    def perform_update(self, serializer):
        ancien_statut = self.get_object().statut_livraison
        commande = serializer.save()
        if ancien_statut != commande.statut_livraison:
            notify_status_change(commande)


class CommandeItemViewSet(viewsets.ModelViewSet):
    queryset           = CommandeItem.objects.all()
    serializer_class   = CommandeItemSerializer
