"""
catalog/services.py
-------------------
Couche de services pour l'application Catalog.

Ce module centralise la logique métier complexe qui ne devrait pas résider dans les vues (views.py)
ni directement dans les modèles (models.py). Il suit le design pattern "Service Layer",
permettant une meilleure testabilité et une réutilisation du code à travers différents points d'entrée
(API REST, Commandes Management, Signaux, etc.).

Principales responsabilités :
- Orchestration du tunnel de paiement via l'API Stripe.
- Gestion du cycle de vie des notifications (création et routage).
- Interface avec la couche temps réel (Django Channels / WebSockets).
"""

import stripe
from django.conf import settings

# Configuration globale de la clé API Stripe extraite des paramètres Django.
# 👉 Voir les détails d'implémentation dans le fichier README.md, section "Gestion du Tunnel Stripe".
stripe.api_key = settings.STRIPE_SECRET_KEY


# ─────────────────────────────────────────────
# 1. SERVICES DE PAIEMENT (STRIPE)
# ─────────────────────────────────────────────

def create_payment_intent(amount_cents: int, user_email: str) -> dict:
    """
    Initialise une intention de paiement (PaymentIntent) auprès de Stripe.

    Cette fonction est le point d'entrée du backend pour tout nouveau paiement.
    Elle configure les méthodes de paiement automatiques pour permettre à Stripe de
    proposer dynamiquement les options les plus pertinentes au client (CB, Apple Pay, etc.).

    Logic métier :
    - Conversion du montant en centimes (format exigé par Stripe).
    - Association de l'email utilisateur pour le suivi dans le dashboard Stripe.
    - Activation de 'automatic_payment_methods' pour la conformité aux dernières APIs Stripe.

    Args:
        amount_cents (int): Le montant total de la commande en centimes d'euro.
        user_email (str): L'identifiant email de l'acheteur pour la traçabilité.

    Returns:
        dict: Contient le 'clientSecret', jeton indispensable au frontend pour finaliser le paiement.

    Raises:
        ValueError: Si le montant fourni est invalide (<= 0).
        stripe.error.StripeError: En cas d'échec de communication ou de rejet par l'API Stripe.
    """
    if amount_cents <= 0:
        raise ValueError("Le montant de la transaction doit être strictement positif.")

    intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency='eur',
        # Active les méthodes de paiement dynamiques (Cartes, Portefeuilles numériques, etc.)
        automatic_payment_methods={
            'enabled': True,
        },
        description=f"Commande Food Market - Client: {user_email}",
    )
    return {'clientSecret': intent['client_secret']}


# ─────────────────────────────────────────────
# 2. SERVICES DE MESSAGERIE & NOTIFICATIONS
# ─────────────────────────────────────────────

def notify_admins_new_message(message) -> None:
    """
    Génère des notifications internes pour l'équipe administrative lors d'un nouveau contact.

    Cette fonction itère sur tous les utilisateurs ayant le rôle 'admin' pour leur
    assigner une nouvelle notification en base de données. 

    Note sur l'architecture :
    La diffusion temps réel (WebSocket) n'est pas appelée ici directement. 
    Elle est déclenchée par le signal `post_save` du modèle Notification situé dans `catalog/signals.py`.
    Cela garantit que même si une notification est créée via l'interface d'administration Django,
    l'alerte sera envoyée en temps réel.

    Args:
        message (MessageContact): L'instance du message de contact venant d'être sauvegardée.
    """
    # Importations locales pour prévenir les dépendances circulaires entre modules.
    from .models import Notification
    from accounts.models import Utilisateur

    # Récupération de tous les comptes ayant des privilèges administratifs.
    admins = Utilisateur.objects.filter(role='admin')
    
    for admin in admins:
        # Mesure de sécurité/confort : Un admin ne reçoit pas de notification pour son propre message.
        if message.user and admin.id == message.user.id:
            continue

        Notification.objects.create(
            user=admin,
            titre="Nouveau message client",
            description=f"{message.nom} sollicite le support : {message.sujet}",
            url_redirection="/admin/messages",
        )


def notify_client_reply(message) -> None:
    """
    Notifie un client utilisateur qu'une réponse a été apportée à son ticket de support.

    Crée une entrée dans la table Notification liée au compte de l'utilisateur expéditeur.
    L'URL de redirection inclut un paramètre 'open' pour permettre au frontend d'ouvrir
    directement la conversation concernée.

    Args:
        message (MessageContact): L'instance du message (réponse admin) concerné.
    """
    from .models import Notification

    # On ne notifie que si le message est lié à un compte utilisateur authentifié.
    if message.user:
        Notification.objects.create(
            user=message.user,
            titre="Réponse du support",
            description=f"Une réponse est disponible pour votre message : {message.sujet}",
            url_redirection=f"/profile/messages?open={message.id}",
        )


# ─────────────────────────────────────────────
# 3. SERVICES TEMPS RÉEL (WEBSOCKETS / CHANNELS)
# ─────────────────────────────────────────────

def broadcast_notification_via_ws(notification) -> None:
    """
    Expédie une notification vers les clients connectés via le protocole WebSocket.

    Cette fonction fait le pont entre le monde synchrone de Django (ORM/Signaux) 
    et le monde asynchrone de Django Channels (ASGI).

    Stratégie de routage :
    1. Routage Individuel : Envoi au groupe `user_{id}` du destinataire.
    2. Routage Administratif : Si le destinataire est admin, envoi au groupe global `admin_notifications`.

    👉 Voir les détails d'implémentation dans le fichier README.md, section "Architecture des Notifications Temps Réel".

    Args:
        notification (Notification): L'instance de notification à diffuser.
    """
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    try:
        channel_layer = get_channel_layer()
        
        # Préparation du dictionnaire de données (Payload) pour le frontend.
        # On s'assure que les dates sont au format ISO pour la compatibilité JSON.
        payload = {
            'id': notification.id,
            'titre': notification.titre,
            'description': notification.description,
            'url_redirection': notification.url_redirection,
            'created_at': (
                notification.created_at.isoformat()
                if notification.created_at else None
            ),
        }

        # Diffusion vers le canal personnel de l'utilisateur.
        # Permet l'affichage des Toasts et la mise à jour de la cloche en temps réel.
        if notification.user:
            user_group = f"user_{notification.user.id}"
            async_to_sync(channel_layer.group_send)(
                user_group,
                {
                    'type': 'send_admin_notification', # Méthode cible dans le Consumer
                    'valeur': payload,
                },
            )

        # Diffusion redondante vers le groupe admin pour les outils de monitoring globaux.
        if notification.user and notification.user.role == 'admin':
            async_to_sync(channel_layer.group_send)(
                'admin_notifications',
                {
                    'type': 'send_admin_notification',
                    'valeur': payload,
                },
            )
            
    except Exception as e:
        # On capture les erreurs d'infrastructure (ex: Redis indisponible) pour ne pas bloquer 
        # le flux principal de l'application (sauvegarde en base).
        print(f"[WS-ERR] Échec de diffusion : {e}")
