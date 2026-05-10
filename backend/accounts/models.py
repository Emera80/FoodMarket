
# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser

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

    def __str__(self):
        return self.nom or self.email

    class Meta:
        db_table = 'users'