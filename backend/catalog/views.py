from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action # <-- Ajoute cet import
from rest_framework.response import Response # <-- Ajoute cet import
from django.db.models import Sum
from django.db.models.functions import Coalesce

from .models import Restaurant, Plat
from .serializers import RestaurantSerializer, PlatSerializer, AvisSerializer
from .models import ContactMessage, Notification 
# Importe ton modèle Utilisateur
from accounts.models import Utilisateur
from .serializers import ContactMessageSerializer, NotificationSerializer

# Create your views here.

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_queryset(self):
        user = self.request.user
        # L'admin voit tout, le client ne voit que ses messages
        if getattr(user, 'role', '') == 'admin':
            return ContactMessage.objects.all()
        return ContactMessage.objects.filter(user=user)

    def perform_create(self, serializer):
        # On lie le message à l'utilisateur connecté
        message = serializer.save(user=self.request.user if self.request.user.is_authenticated else None)
        
        # Notification pour l'ADMIN uniquement
        admins = Utilisateur.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                titre="Nouveau message client",
                description=f"{message.nom} a envoyé un message : {message.sujet}",
                url_redirection="/admin/messages"
            )
    # --- AJOUTE CECI ---
    @action(detail=True, methods=['post'])
    def repondre(self, request, pk=None):
        message = self.get_object()
        reponse_texte = request.data.get('reponse', '')

        # 1. On enregistre la réponse dans le message
        message.reponse = reponse_texte
        message.est_lu = True
        message.save()

        # 2. Notification pour le CLIENT uniquement
        if message.user:
            Notification.objects.create(
                user=message.user,
                titre="Réponse du support",
                description=f"L'admin a répondu à votre message : {message.sujet}",
                url_redirection=f"/profile/messages?open={message.id}"
            )
        
        return Response({'status': 'Réponse envoyée'})

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # L'admin ne voit que ses propres notifications
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def marquer_tout_lu(self, request):
        self.get_queryset().update(est_lu=True)
        return Response({'status': 'ok'})

class RestaurantViewSet(viewsets.ModelViewSet):
    # On récupère uniquement les restaurants actifs pour le catalogue
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    # L'admin voit tout, les clients ne voient que les restaurants actifs
    def get_queryset(self):
        if self.request.user.is_authenticated and getattr(self.request.user, 'role', '') == 'admin':
            return Restaurant.objects.all()
        return Restaurant.objects.filter(is_active=True)

    # IsAuthenticatedOrReadOnly : Lecture (GET) pour tout le monde,
    # Écriture (POST, PUT, DELETE) uniquement pour les connectés (et on pourrait restreindre aux admins plus tard)
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'])
    def categories(self, request):
        # Va chercher tous les types de cuisine, retire les doublons (distinct)
        cuisines = Restaurant.objects.values_list('type_cuisine', flat=True).distinct()
        # Retire les valeurs nulles ou vides par sécurité
        cuisines_propres = [c for c in cuisines if c]
        return Response(cuisines_propres)

    @action(detail=True, methods=['post'])
    def ajouter_avis(self, request, pk=None):
        restaurant = self.get_object()
        # On passe les données du Front-End au Serializer
        serializer = AvisSerializer(data=request.data)
        if serializer.is_valid():
            # On enregistre l'avis en forçant l'utilisateur connecté et le restaurant actuel
            serializer.save(user=request.user, restaurant=restaurant)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class PlatViewSet(viewsets.ModelViewSet):
    queryset = Plat.objects.all()
    serializer_class = PlatSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    # ON REMPLACE L'ATTRIBUT STATIQUE 'queryset' PAR UNE FONCTION DYNAMIQUE
    def get_queryset(self):
        # Si l'utilisateur qui fait la requête est connecté ET que son rôle est 'admin'
        if self.request.user.is_authenticated and getattr(self.request.user, 'role', '') == 'admin':
            return Plat.objects.all() # L'admin voit TOUT (disponible ou non)
            
        # Pour les clients normaux et les visiteurs non connectés
        return Plat.objects.filter(is_available=True)

    @action(detail=False, methods=['get']) # 2. <-- LE SYMBOLE "@" MANQUANT EST ICI !
    def top_ventes(self, request):
        top_plats = Plat.objects.filter(is_available=True).annotate(
            total_vendu=Coalesce(Sum('commande_items__quantite'), 0)
        ).order_by('-total_vendu', '-id')[:4]

        if not top_plats or top_plats[0].total_vendu == 0:
            top_plats = Plat.objects.filter(is_available=True).order_by('-id')[:4]

        serializer = self.get_serializer(top_plats, many=True)
        return Response(serializer.data)
