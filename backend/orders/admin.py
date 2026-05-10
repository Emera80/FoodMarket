from django.contrib import admin
from .models import Commande, CommandeItem

# L'astuce Pro : Afficher les éléments de commande DANS la commande
class CommandeItemInline(admin.TabularInline):
    model = CommandeItem
    extra = 0  # Ne pas afficher de lignes vides inutiles par défaut
    readonly_fields = ('sous_total',)  # Empêche de modifier le sous-total manuellement pour éviter les erreurs


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'restaurant', 'date', 'total', 'statut_livraison', 'mode_paiement')
    list_filter = ('statut_livraison', 'mode_paiement', 'date', 'restaurant')

    # Permet de chercher une commande en tapant le nom ou l'email du client
    search_fields = ('user__nom', 'user__email')

    # On intègre la liste des plats ici
    inlines = [CommandeItemInline]

# Register your models here.
