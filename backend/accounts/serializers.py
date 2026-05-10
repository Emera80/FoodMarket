from rest_framework import serializers
from django.db.models import Sum
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Utilisateur


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer JWT personnalisé qui inclut le rôle et l'id dans la réponse."""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['user_id'] = self.user.id
        data['nom'] = self.user.nom
        return data


class UtilisateurSerializer(serializers.ModelSerializer):
    # 1. On déclare les champs virtuels pour les statistiques
    nombre_commandes = serializers.SerializerMethodField()
    total_depense = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        # 2. On ajoute 'created_at', 'nombre_commandes' et 'total_depense' à la liste
        fields = [
            'id', 'username', 'nom', 'email', 'telephone', 'role', 
            'adresse', 'password', 'avatar', 'created_at', 
            'nombre_commandes', 'total_depense'
        ]
        # On protège les champs sensibles
        read_only_fields = ['role', 'created_at', 'nombre_commandes', 'total_depense']

        extra_kwargs = {
            'password': {'write_only': True}
        }

    # --- CALCUL DU NOMBRE DE COMMANDES ---
    def get_nombre_commandes(self, obj):
        # On compte combien de commandes sont associées à cet utilisateur
        return obj.commandes.count()

    # --- CALCUL DU TOTAL DÉPENSÉ ---
    def get_total_depense(self, obj):
        # On additionne le champ 'total' de toutes ses commandes
        total = obj.commandes.aggregate(total_sum=Sum('total'))['total_sum']
        return total if total is not None else 0.000

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance