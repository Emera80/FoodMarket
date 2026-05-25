from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import update_session_auth_hash

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
        user = self.request.user
        if getattr(user, 'role', '') == 'admin':
            return Utilisateur.objects.with_stats()
        if user.is_authenticated:
            return Utilisateur.objects.with_stats().filter(id=user.id)
        return Utilisateur.objects.none()

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    # On met à jour avec les nouvelles données, ou on garde les anciennes si le champ est vide
    user.nom = request.data.get('nom', user.nom)
    user.email = request.data.get('email', user.email)
    user.save()
    return Response({'message': 'Profil mis à jour avec succès', 'nom': user.nom, 'email': user.email})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    # Vérification de l'ancien mot de passe
    if not user.check_password(old_password):
        return Response({'error': 'Ancien mot de passe incorrect'}, status=400)

    # Définition du nouveau mot de passe
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Mot de passe modifié avec succès'})