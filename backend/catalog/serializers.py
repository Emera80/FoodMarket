from rest_framework import serializers
from .models import Restaurant, Plat, Avis, ContactMessage, Notification



# catalog/serializers.py
class AvisSerializer(serializers.ModelSerializer):
    # On récupère le nom et l'avatar directement depuis le modèle Utilisateur
    user_name = serializers.CharField(source='user.nom', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = Avis
        fields = ['id', 'user_name', 'user_avatar', 'note', 'commentaire', 'created_at']

class PlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plat
        fields = '__all__' # On demande à DRF d'inclure tous les champs du modèle

class RestaurantSerializer(serializers.ModelSerializer):
    avis = AvisSerializer(many=True, read_only=True)
    plats = PlatSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id', 'nom', 'description', 'image', 'adresse', 'telephone', 'horaires',
            'type_cuisine', 'note_moyenne', 'temps_livraison_estime',
            'is_active', 'avis', 'plats'
        ]

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'