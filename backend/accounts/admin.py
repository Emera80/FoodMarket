from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur


@admin.register(Utilisateur)
class CustomUserAdmin(UserAdmin):
    # Les colonnes visibles dans le tableau général
    list_display = ('email', 'nom', 'telephone', 'role', 'is_active', 'date_joined')

    # Les filtres sur le côté droit
    list_filter = ('role', 'is_active', 'is_staff')

    # La barre de recherche
    search_fields = ('email', 'nom', 'telephone')

    # Pour que les champs personnalisés soient modifiables quand on clique sur un utilisateur
    fieldsets = UserAdmin.fieldsets + (
        ('Informations Supplémentaires', {'fields': ('telephone', 'role', 'adresse')}),
    )

# Register your models here.
