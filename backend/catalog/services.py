"""
catalog/services.py
-------------------
Couche Service de l'application catalog.
Contient toute la logique métier complexe : paiement Stripe,
création de notifications, et diffusion WebSocket.
Les vues (views.py) appellent ces fonctions et se limitent au rôle HTTP.
"""

import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


# ─────────────────────────────────────────────
# 1. SERVICE STRIPE
# ─────────────────────────────────────────────

def create_payment_intent(amount_cents: int, user_email: str) -> dict:
    """
    Crée un PaymentIntent Stripe et retourne le client_secret.

    Args:
        amount_cents: Montant en centimes (ex: 1050 pour 10,50 €).
        user_email:   Email de l'utilisateur pour la description.

    Returns:
        dict avec la clé 'clientSecret'.

    Raises:
        stripe.error.StripeError: En cas d'erreur côté Stripe.
        ValueError: Si le montant est nul ou négatif.
    """
    if amount_cents <= 0:
        raise ValueError("Le montant doit être supérieur à zéro.")

    intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency='eur',
        payment_method_types=['card'],
        description=f"Commande pour l'utilisateur {user_email}",
    )
    return {'clientSecret': intent['client_secret']}


# ─────────────────────────────────────────────
# 2. SERVICES DE NOTIFICATION
# ─────────────────────────────────────────────

def notify_admins_new_message(message) -> None:
    """
    Crée une notification en base pour tous les admins
    quand un nouveau message de contact est reçu.
    L'envoi WebSocket est déclenché automatiquement via le signal post_save.
    """
    # Import local pour éviter les imports circulaires
    # (catalog.models importe déjà des dépendances externes)
    from .models import Notification
    from accounts.models import Utilisateur

    admins = Utilisateur.objects.filter(role='admin')
    for admin in admins:
        Notification.objects.create(
            user=admin,
            titre="Nouveau message client",
            description=f"{message.nom} a envoyé un message : {message.sujet}",
            url_redirection="/admin/messages",
        )


def notify_client_reply(message) -> None:
    """
    Crée une notification en base pour le client
    quand l'admin répond à son message de contact.
    """
    from .models import Notification

    if message.user:
        Notification.objects.create(
            user=message.user,
            titre="Réponse du support",
            description=f"L'admin a répondu à votre message : {message.sujet}",
            url_redirection=f"/profile/messages?open={message.id}",
        )


# ─────────────────────────────────────────────
# 3. SERVICE WEBSOCKET
# ─────────────────────────────────────────────

def broadcast_notification_via_ws(notification) -> None:
    """
    Diffuse une notification vers tous les clients WebSocket connectés
    au groupe 'admin_notifications' via Django Channels / Redis.

    Appelé par le signal post_save de Notification (signals.py),
    jamais directement depuis une vue ou un modèle.
    """
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'admin_notifications',
            {
                'type': 'send_admin_notification',
                'valeur': {
                    'id': notification.id,
                    'titre': notification.titre,
                    'description': notification.description,
                    'url_redirection': notification.url_redirection,
                    'created_at': (
                        notification.created_at.isoformat()
                        if notification.created_at else None
                    ),
                },
            },
        )
    except Exception as e:
        print(f"[WS] Erreur lors de l'envoi de la notification : {e}")
