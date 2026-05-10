from rest_framework import serializers
from .models import Commande, CommandeItem


class CommandeItemSerializer(serializers.ModelSerializer):
    plat_nom = serializers.SerializerMethodField()
    class Meta:
        model = CommandeItem
        # On ne met pas 'commande' ici, car il sera déduit automatiquement
        fields = ['id', 'plat', 'quantite', 'prix_unitaire', 'sous_total', 'plat_nom']

    def get_plat_nom(self, obj):
        return obj.plat.nom if obj.plat else "Plat inconnu"


class CommandeSerializer(serializers.ModelSerializer):
    # ATTENTION : On a enlevé le 'read_only=True' pour autoriser l'écriture !
    items = CommandeItemSerializer(many=True)
    # 2. Méthodes sécurisées pour les infos associées
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    restaurant_nom = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id', 'user', 'restaurant', 'date', 'total',
            'statut_livraison', 'adresse_livraison', 'mode_paiement', 'items', 'user_name', 'user_phone', 'restaurant_nom'
        ]
        # Ces champs sont protégés. Le React ne doit pas pouvoir les modifier directement.
        # L'utilisateur sera ajouté automatiquement par notre Vue grâce au JWT.
        read_only_fields = ['user', 'date']

# --- FONCTIONS DE RÉCUPÉRATION (Remplace le "source=...") ---
    def get_user_name(self, obj):
        return getattr(obj.user, 'nom', f"Client #{obj.user.id}")

    def get_user_phone(self, obj):
        return getattr(obj.user, 'telephone', "Non renseigné")

    def get_restaurant_nom(self, obj):
        return obj.restaurant.nom if obj.restaurant else "Restaurant inconnu"


    # C'est ici que la magie opère : on réécrit la méthode de création
    def create(self, validated_data):
        # 1. On extrait la liste des plats (les items) de la requête
        items_data = validated_data.pop('items')

        # 2. On crée d'abord la Commande (sans les plats)
        commande = Commande.objects.create(**validated_data)

        # 3. On boucle sur les plats reçus pour les attacher à la commande qu'on vient de créer
        for item_data in items_data:
            CommandeItem.objects.create(commande=commande, **item_data)

        # 4. On renvoie la commande complète et finie
        return commande

    # --- MÉTHODE DE MISE À JOUR (C'EST ICI QUE L'ERREUR DE STATUT SE RÈGLE !) ---
    def update(self, instance, validated_data):
        # On retire les items car on ne fait que changer le statut
        validated_data.pop('items', None)
        
        # On met à jour les champs restants (ici, le statut_livraison)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance