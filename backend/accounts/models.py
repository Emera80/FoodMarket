
# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager


# ─────────────────────────────────────────────
# MANAGERS PERSONNALISÉS
# ─────────────────────────────────────────────

class UtilisateurManager(UserManager):
    """
    Manager custom pour Utilisateur.
    Étend UserManager (create_user / create_superuser conservés).
    Centralise les requêtes ORM avec annotations évitant les N+1 queries.
    """

    def with_stats(self):
        """
        Retourne le queryset annoté avec :
          - nombre_commandes : COUNT des commandes liées
          - total_depense    : SUM du champ 'total' (NULL → 0)
        Évite N+1 : une seule requête SQL au lieu d'une par utilisateur.
        """
        from django.db.models import Count, Sum
        from django.db.models.functions import Coalesce
        return self.annotate(
            nombre_commandes=Count('commandes', distinct=True),
            total_depense=Coalesce(Sum('commandes__total'), 0, output_field=models.DecimalField()),
        )


class Utilisateur(AbstractUser):
    """Table users"""
    ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('client', 'Client'),
    ]

    nom = models.CharField(max_length=150)
    email = models.EmailField(max_length=150, unique=True)
    telephone = models.CharField(max_length=20)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    adresse = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nom', 'telephone']

    # Manager personnalisé (create_user/create_superuser conservés via UserManager)
    objects = UtilisateurManager()

    def __str__(self):
        return self.nom or self.email

    class Meta:
        db_table = 'users'