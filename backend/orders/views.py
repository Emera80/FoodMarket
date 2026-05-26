"""
orders/views.py
---------------
Vues "Skinny" : rôle strictement HTTP.
La logique de notification est déléguée à orders/services.py.
Le filtrage ORM est délégué à CommandeManager (orders/models.py).
"""
from django.http import FileResponse
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.conf import settings
import io
import datetime
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Commande, CommandeItem
from .serializers import CommandeSerializer, CommandeItemSerializer
from .services import notify_new_order, notify_status_change
# Exemple avec la librairie xhtml2pdf
from xhtml2pdf import pisa
class CommandeViewSet(viewsets.ModelViewSet):
    serializer_class   = CommandeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Commande.objects.none()

        if getattr(user, 'role', None) == 'admin':
            user_id = self.request.query_params.get('user')
            return Commande.objects.for_admin(user_id=user_id)

        return Commande.objects.for_user(user)

    def perform_create(self, serializer):
        commande = serializer.save(user=self.request.user)
        notify_new_order(commande, self.request.user)

    def perform_update(self, serializer):
        ancien_statut = self.get_object().statut_livraison
        commande = serializer.save()
        if ancien_statut != commande.statut_livraison:
            notify_status_change(commande)


class CommandeItemViewSet(viewsets.ModelViewSet):
    queryset           = CommandeItem.objects.all()
    serializer_class   = CommandeItemSerializer


class DeliveryFeeView(APIView):
    """
    Vue pour récupérer les frais de livraison configurés dans les settings.
    Accessible par tout le monde pour le calcul du panier.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return HttpResponse(settings.DELIVERY_FEE, content_type="text/plain")


class GenererFacturePDFView(APIView):
    """
    Vue API pour la génération de factures au format PDF.
    
    Cette vue récupère les détails d'une commande, prépare les données pour l'affichage
    et utilise la librairie xhtml2pdf pour convertir un template HTML en document PDF
    téléchargeable.
    
    Sécurité :
    - La vue vérifie l'existence de la commande.
    - (Optionnel) Des contrôles d'accès peuvent être activés pour restreindre la vue
      aux propriétaires de la commande ou aux administrateurs.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, commande_id):
        """
        Gère la requête GET pour générer le PDF.
        
        Étapes du processus :
        1. Récupération de la commande depuis la base de données.
        2. Formatage des données "brutes" pour un affichage propre (Nettoyage).
        3. Rendu du template HTML avec le contexte préparé.
        4. Conversion du flux HTML en binaire PDF via xhtml2pdf (pisa).
        5. Retour du fichier via une HttpResponse avec les headers appropriés.
        """
        
        # 1. Récupération de la commande
        # On utilise get_object_or_404 pour renvoyer une erreur 404 propre si l'ID est invalide.
        commande = get_object_or_404(Commande, id=commande_id)

        # 2. Sécurité : Vérifier les droits d'accès
        # On s'assure que seul le client concerné ou un admin peut voir la facture.
        if commande.user != request.user and not request.user.is_staff:
            return HttpResponse('Accès refusé', status=403)

        # 3. Gestion du numéro de facture
        # Si la commande n'a pas encore de numéro officiel, on en génère un à la volée.
        if not commande.numero_facture:
            # On utilise une méthode du modèle ou une logique locale
            annee = datetime.datetime.now().year
            commande.numero_facture = f"FAC-{annee}-{commande.id:04d}"
            commande.save()

        # 4. Nettoyage et Préparation des données (Context)
        # On évite de faire des transformations complexes dans le template HTML.
        
        # Nettoyage du mode de paiement (ex: "mobile_money" -> "Mobile money")
        mode_paiement_display = "Non spécifié"
        if commande.mode_paiement:
            mode_paiement_display = commande.mode_paiement.replace('_', ' ').capitalize()

        # Construction du nom du client
        nom_client = getattr(commande.user, 'nom', "")
        if not nom_client:
            if commande.user.first_name or commande.user.last_name:
                nom_client = f"{commande.user.first_name} {commande.user.last_name}".strip()
            else:
                nom_client = commande.user.username

        # Récupération du téléphone
        telephone_client = getattr(commande.user, 'telephone', "Non renseigné")
        if not telephone_client or telephone_client == "Non renseigné":
            telephone_client = commande.telephone_paiement or "Non renseigné"

        # Préparation du contexte pour le moteur de template Django
        context = {
            'commande': commande,
            'nom_client': nom_client,
            'telephone_client': telephone_client,
            'mode_paiement_clean': mode_paiement_display,
            'numero_facture': commande.numero_facture,
            'date_generation': datetime.datetime.now(),
            'frais_livraison': f"{settings.DELIVERY_FEE:.3f}",
            'restaurant_nom': commande.restaurant.nom if commande.restaurant else "FoodMarket"
        }

        # 5. Rendu du template HTML en chaîne de caractères
        # On transforme le fichier .html en une longue chaîne de texte HTML pur.
        html_string = render_to_string('invoices/facture.html', context)

        # 6. Initialisation du buffer mémoire
        # On utilise io.BytesIO() pour stocker le PDF en mémoire RAM plutôt que sur le disque.
        pdf_buffer = io.BytesIO()

        # 7. Conversion HTML -> PDF
        # pisa.CreatePDF est le moteur qui fait le travail de rendu.
        pisa_status = pisa.CreatePDF(
            html_string,           # Le contenu HTML
            dest=pdf_buffer,       # La destination (notre buffer mémoire)
            encoding='utf-8'       # Encodage pour supporter les accents français
        )

        # Vérification des erreurs de conversion
        if pisa_status.err:
            return HttpResponse('Erreur technique lors de la génération du PDF', status=500)

        # 8. Préparation de la réponse HTTP
        # On replace le curseur au début du buffer pour que Django puisse lire tout le contenu.
        pdf_buffer.seek(0)
        
        # Log des items pour débogage (optionnel en prod mais utile ici pour vérifier l'accès aux données)
        # print(f"Génération PDF pour commande {commande.id} avec {commande.items.count()} articles.")

        response = HttpResponse(pdf_buffer, content_type='application/pdf')

        # Configuration du nom de fichier pour le téléchargement
        filename = f"Facture_{commande.numero_facture}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        # Pour plus de détails techniques sur ce processus, voir le fichier README.md du backend.
        return response