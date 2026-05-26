from django.db import models
from django.conf import settings

# ─────────────────────────────────────────────
# 1. MANAGERS PERSONNALISÉS (BUSINESS LOGIC)
# ─────────────────────────────────────────────

class PlatManager(models.Manager):
    """
    Gestionnaire personnalisé pour l'entité Plat.
    
    Centralise les requêtes complexes liées aux plats, permettant de garder
    les vues (views.py) propres et focalisées sur la gestion des requêtes HTTP.
    Suit le principe "Fat Models, Skinny Controllers".
    """

    def top_ventes(self, limit: int = 4):
        """
        Calcule et retourne les plats les plus populaires de la plateforme.
        
        Logique de calcul :
        1. Filtre uniquement les plats marqués comme disponibles.
        2. Effectue une jointure (annotate) avec les items de commande.
        3. Somme les quantités vendues par plat.
        4. Coalesce(Sum, 0) : Remplace par 0 si le plat n'a jamais été vendu (évite les NULL).
        5. Tri décroissant par popularité puis par ID (nouveauté).
        
        Args:
            limit (int): Nombre maximum de résultats souhaités (défaut: 4).
            
        Returns:
            QuerySet: Liste des plats les plus vendus ou les plus récents en fallback.
        """
        from django.db.models import Sum
        from django.db.models.functions import Coalesce

        top = (
            self.filter(is_available=True)
            .annotate(total_vendu=Coalesce(Sum('commande_items__quantite'), 0))
            .order_by('-total_vendu', '-id')[:limit]
        )

        # Fallback intelligent : Si aucune vente n'est enregistrée globalement,
        # on retourne les plats les plus récemment ajoutés pour remplir la section.
        if not top or top[0].total_vendu == 0:
            return self.filter(is_available=True).order_by('-id')[:limit]

        return top


# ─────────────────────────────────────────────
# 2. MODÈLES DE DONNÉES (ENTITIES)
# ─────────────────────────────────────────────

class Restaurant(models.Model):
    """
    Représente un établissement partenaire sur la plateforme.
    """
    nom = models.CharField(max_length=150, help_text="Nom commercial du restaurant.")
    description = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=255, null=True, blank=True, help_text="URL de l'image de couverture.")
    adresse = models.TextField()
    telephone = models.CharField(max_length=20, null=True, blank=True)
    horaires = models.CharField(max_length=100, null=True, blank=True, help_text="Ex: 11h-23h non stop")
    type_cuisine = models.CharField(max_length=100, help_text="Ex: Italienne, Sushi, Burger...")
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, help_text="Calculée à partir des avis.")
    temps_livraison_estime = models.IntegerField(help_text="Durée moyenne de livraison en minutes.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.nom

    class Meta:
        db_table = 'restaurants'
        verbose_name = "Restaurant"


class Plat(models.Model):
    """
    Représente un article du menu d'un restaurant.
    """
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='plats')
    nom = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    prix = models.DecimalField(max_digits=10, decimal_places=3, help_text="Prix unitaire.")
    image = models.CharField(max_length=255, null=True, blank=True)
    categorie = models.CharField(max_length=100, help_text="Ex: Entrées, Plats de résistance...")
    is_available = models.BooleanField(default=True, help_text="Permet de masquer un plat temporairement (rupture).")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    # Branchement du manager personnalisé pour les statistiques de vente.
    objects = PlatManager()

    def __str__(self):
        return self.nom

    class Meta:
        db_table = 'plats'
        verbose_name = "Plat"


class Avis(models.Model):
    """
    Témoignage et notation laissés par un client sur un restaurant.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='avis')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='avis')
    note = models.PositiveSmallIntegerField(default=5, help_text="Note sur 5 étoiles.")
    commentaire = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'avis'
        verbose_name = "Avis"
        verbose_name_plural = "Avis"

    def __str__(self):
        return f"Avis de {self.user.nom} pour {self.restaurant.nom}"


class ContactMessage(models.Model):
    """
    Formulaire de contact envoyé par un utilisateur (connecté ou anonyme).
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages_contact')
    nom = models.CharField(max_length=100)
    email = models.EmailField()
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    reponse = models.TextField(null=True, blank=True, help_text="Champ rempli par l'administrateur lors de la réponse.")
    est_lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']
        verbose_name = "Message de contact"

    def __str__(self):
        return f"Message de {self.nom} - {self.sujet}"


class Notification(models.Model):
    """
    Notification interactive stockée pour un utilisateur spécifique.
    
    Cycle de vie :
    1. Création en base de données.
    2. Déclenchement automatique d'un signal 'post_save' (signals.py).
    3. Diffusion asynchrone via WebSocket vers le navigateur.
    
    Note technique : Ce modèle est totalement indépendant de Redis/WebSockets pour 
    garantir la stabilité de l'ORM. La diffusion est gérée par la couche Services.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=255)
    description = models.TextField()
    url_redirection = models.CharField(max_length=255, help_text="Lien frontend (ex: /orderhistory).")
    est_lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        verbose_name = "Notification"

    def __str__(self):
        return f"[{self.user}] {self.titre}"
