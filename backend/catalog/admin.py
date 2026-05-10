# Register your models here.
from django.contrib import admin
from .models import Plat, Restaurant

@admin.register(Plat)
class PlatAdmin(admin.ModelAdmin):
    # Affiche ces colonnes dans le tableau de bord
    list_display = ('nom', 'restaurant', 'prix', 'categorie', 'is_available')
    # Permet de filtrer sur le côté par restaurant, catégorie ou disponibilité
    list_filter = ('restaurant', 'categorie', 'is_available')
    # Ajoute même une barre de recherche !
    search_fields = ('nom', 'description')

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type_cuisine', 'note_moyenne', 'is_active')
    list_filter = ('type_cuisine', 'is_active')
    search_fields = ('nom',)
    