from django.db import models
from django.conf import settings


# ─────────────────────────────────────────────
# MANAGERS PERSONNALISÉS
# ─────────────────────────────────────────────

class PlatManager(models.Manager):
    """
    Manager custom pour Plat.
    Regroupe les requêtes ORM complexes, garde les vues légères.
    """

    def top_ventes(self, limit: int = 4):
        """
        Retourne les <limit> plats disponibles les plus commandés,
        triés par quantité totale vendue décroissante.
        Fallback sur les plus récents si aucune commande n'existe encore.
        """
        from django.db.models import Sum
        from django.db.models.functions import Coalesce

        top = (
            self.filter(is_available=True)
            .annotate(total_vendu=Coalesce(Sum('commande_items__quantite'), 0))
            .order_by('-total_vendu', '-id')[:limit]
        )

        # Fallback si aucune vente n'a encore été enregistrée
        if not top or top[0].total_vendu == 0:
            return self.filter(is_available=True).order_by('-id')[:limit]

        return top


# ─────────────────────────────────────────────
# MODÈLES
# ─────────────────────────────────────────────

class Avis(models.Model):
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='avis')
    restaurant  = models.ForeignKey('Restaurant', on_delete=models.CASCADE, related_name='avis')
    note        = models.PositiveSmallIntegerField(default=5)
    commentaire = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'avis'
        verbose_name_plural = "Avis"

    def __str__(self):
        return f"Avis de {self.user.nom} pour {self.restaurant.nom}"


class Restaurant(models.Model):
    nom                    = models.CharField(max_length=150)
    description            = models.TextField(null=True, blank=True)
    image                  = models.CharField(max_length=255, null=True, blank=True)
    adresse                = models.TextField()
    telephone              = models.CharField(max_length=20, null=True, blank=True)
    horaires               = models.CharField(max_length=100, null=True, blank=True)
    type_cuisine           = models.CharField(max_length=100)
    note_moyenne           = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    temps_livraison_estime = models.IntegerField(help_text="en minutes")
    is_active              = models.BooleanField(default=True)
    created_at             = models.DateTimeField(auto_now_add=True, null=True)
    updated_at             = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.nom

    class Meta:
        db_table = 'restaurants'


class Plat(models.Model):
    restaurant   = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='plats')
    nom          = models.CharField(max_length=150)
    description  = models.TextField(null=True, blank=True)
    prix         = models.DecimalField(max_digits=10, decimal_places=3)
    image        = models.CharField(max_length=255, null=True, blank=True)
    categorie    = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True, null=True)
    updated_at   = models.DateTimeField(auto_now=True, null=True)

    # Manager personnalisé (remplace le manager par défaut)
    objects = PlatManager()

    def __str__(self):
        return self.nom

    class Meta:
        db_table = 'plats'


class ContactMessage(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages_contact')
    nom        = models.CharField(max_length=100)
    email      = models.EmailField()
    sujet      = models.CharField(max_length=200)
    message    = models.TextField()
    reponse    = models.TextField(null=True, blank=True)
    est_lu     = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"Message de {self.nom} - {self.sujet}"


class Notification(models.Model):
    """
    Alerte interactive stockée en base pour un utilisateur.

    La diffusion WebSocket (Channels/Redis) est déléguée au signal
    post_save défini dans signals.py via le service broadcast_notification_via_ws.
    Ce modèle ne contient plus aucune dépendance vers Channels ou Redis.
    """
    user            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    titre           = models.CharField(max_length=255)
    description     = models.TextField()
    url_redirection = models.CharField(max_length=255)
    est_lu          = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.user}] {self.titre}"
