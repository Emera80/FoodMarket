from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated # <--- Import crucial
from .models import Commande, CommandeItem
from .serializers import CommandeSerializer, CommandeItemSerializer
from accounts.models import Utilisateur
from catalog.models import Notification

class CommandeViewSet(viewsets.ModelViewSet):
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Sécurité supplémentaire : Un client ne doit voir QUE ses propres commandes.
        # Si c'est un admin, il peut tout voir (ou filtrer par utilisateur).
        user = self.request.user
        if not user.is_authenticated:
            return Commande.objects.none()

        # On vérifie si l'attribut role existe (cas d'un Custom User Model)
        role = getattr(user, 'role', None)
        if role == 'admin':
            # Si le paramètre ?user=<id> est fourni, on filtre par cet utilisateur
            user_id = self.request.query_params.get('user')
            if user_id:
                return Commande.objects.filter(user__id=user_id)
            return Commande.objects.all()
        return Commande.objects.filter(user=user)

    def perform_create(self, serializer):
        commande = serializer.save(user=self.request.user)
        
        # 1. Notification pour l'ADMIN : Nouvelle commande à traiter
        admins = Utilisateur.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                titre="Nouvelle commande !",
                description=f"Commande #{commande.id} reçue de {self.request.user.nom}",
                url_redirection="/admin/orders"
            )

        # 2. Notification pour le CLIENT : Confirmation de commande
        Notification.objects.create(
            user=self.request.user,
            titre="Commande confirmée",
            description=f"Votre commande #{commande.id} a été enregistrée avec succès.",
            url_redirection="/orderhistory"
        )

    def perform_update(self, serializer):
        # On récupère l'ancienne valeur du statut avant sauvegarde
        instance = self.get_object()
        ancien_statut = instance.statut_livraison
        
        # Sauvegarde de la modification
        commande = serializer.save()
        nouveau_statut = commande.statut_livraison

        # Si le statut a changé, on notifie le client
        if ancien_statut != nouveau_statut:
            Notification.objects.create(
                user=commande.user,
                titre="Mise à jour de votre commande",
                description=f"Votre commande #{commande.id} est maintenant : {commande.get_statut_livraison_display()}",
                url_redirection="/orderhistory"
            )

class CommandeItemViewSet(viewsets.ModelViewSet):
    queryset = CommandeItem.objects.all()
    serializer_class = CommandeItemSerializer