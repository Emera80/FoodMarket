
# Create your models here.
from django.db import models
from django.conf import settings
from django.utils import timezone
from catalog.models import Restaurant, Plat  # Import indispensable !


class Commande(models.Model):
    """Table commandes"""
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('en_preparation', 'En préparation'),
        ('en_livraison', 'En livraison'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]

    PAIEMENT_CHOICES = [
        ('carte', 'Carte'),
        ('livraison', 'Livraison'),
        ('mobile_money', 'Mobile Money'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='commandes')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='commandes')
    date = models.DateTimeField(default=timezone.now)
    total = models.DecimalField(max_digits=10, decimal_places=3)
    statut_livraison = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    adresse_livraison = models.TextField()
    telephone_paiement = models.CharField(max_length=20, null=True, blank=True)
    mode_paiement = models.CharField(max_length=20, choices=PAIEMENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return f"Commande {self.id} - Utilisateur ID: {self.user.id}"

    class Meta:
        db_table = 'commandes'


class CommandeItem(models.Model):
    """Table commande_items"""
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='items')
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE, related_name='commande_items')
    quantite = models.IntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=3)
    sous_total = models.DecimalField(max_digits=10, decimal_places=3)

    def __str__(self):
        return f"{self.quantite}x {self.plat.nom} (Commande {self.commande.id})"

    class Meta:
        db_table = 'commande_items'