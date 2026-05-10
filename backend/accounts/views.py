from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Utilisateur
from .serializers import UtilisateurSerializer, MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    """Vue JWT personnalisée qui retourne aussi le rôle et l'id utilisateur."""
    serializer_class = MyTokenObtainPairSerializer

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer

    def get_permissions(self):
        # On autorise tout le monde à créer un compte (Inscription)
        if self.action == 'create':
            permission_classes = [AllowAny]
        # Mais pour voir ou modifier les profils, il faut être connecté
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # Un utilisateur normal ne peut voir que son propre profil
        # Un admin peut voir tout le monde
        user = self.request.user
        if getattr(user, 'role', '') == 'admin':  # Utilisation sécurisée si user est AnonymousUser
            return Utilisateur.objects.all()
        if user.is_authenticated:
            return Utilisateur.objects.filter(id=user.id)
        return Utilisateur.objects.none()  # Renvoie vide si non connecté