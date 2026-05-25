from django.db import models

# Create your models here.
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class Avis(models.Model):
    # Lien vers l'utilisateur (on utilise ton modèle Utilisateur via settings.AUTH_USER_MODEL)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='avis')
    # Lien vers le restaurant concerné
    restaurant = models.ForeignKey('Restaurant', on_delete=models.CASCADE, related_name='avis')
    
    note = models.PositiveSmallIntegerField(default=5) # Note de 1 à 5
    commentaire = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'avis'
        verbose_name_plural = "Avis"

    def __str__(self):
        return f"Avis de {self.user.nom} pour {self.restaurant.nom}"

class Restaurant(models.Model):
    """Table restaurants"""

    nom = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=255, null=True, blank=True)
    adresse = models.TextField()
    telephone = models.CharField(max_length=20, null=True, blank=True)
    horaires = models.CharField(max_length=100, null=True, blank=True)
    type_cuisine = models.CharField(max_length=100)
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    temps_livraison_estime = models.IntegerField(help_text="en minutes")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)


    def __str__(self):
        return self.nom


    class Meta:
        db_table = 'restaurants'


class Plat(models.Model):
    """Table plats"""

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='plats')
    nom = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=3)
    image = models.CharField(max_length=255, null=True, blank=True)
    categorie = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)


    def __str__(self):
        return self.nom


    class Meta:
        db_table = 'plats'

class ContactMessage(models.Model):
    """Stocke les messages envoyés via le formulaire de contact"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages_contact')
    nom = models.CharField(max_length=100)
    email = models.EmailField()
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    # Champ pour la réponse de l'admin
    reponse = models.TextField(null=True, blank=True)
    est_lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"Message de {self.nom} - {self.sujet}"

class Notification(models.Model):
    """Stocke les alertes interactives pour l'administrateur"""
    # On lie la notification à l'admin (ou aux admins)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=255)
    description = models.TextField()
    url_redirection = models.CharField(max_length=255) # Ex: /admin/orders
    est_lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Si c'est une nouvelle notification, on l'envoie via WebSocket
        if is_new:
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    'admin_notifications',  # Le groupe défini dans consumers.py
                    {
                        'type': 'send_admin_notification', # La méthode dans consumers.py
                        'valeur': {
                            'id': self.id,
                            'titre': self.titre,
                            'description': self.description,
                            'url_redirection': self.url_redirection,
                            'created_at': self.created_at.isoformat() if self.created_at else None,
                        }
                    }
                )
            except Exception as e:
                print(f"Erreur lors de l'envoi de la notification WS : {e}")