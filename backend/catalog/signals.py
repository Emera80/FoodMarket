"""
catalog/signals.py
------------------
Signaux Django pour l'application catalog.
Découple le modèle Notification de l'infrastructure WebSocket :
le modèle ne connaît plus Channels/Redis, le signal s'en charge.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Notification
from .services import broadcast_notification_via_ws


@receiver(post_save, sender=Notification)
def on_notification_created(sender, instance, created, **kwargs):
    """
    Après chaque création d'une Notification en base,
    diffuse automatiquement l'événement via WebSocket.
    Ne s'exécute PAS lors d'une simple mise à jour (created=False).
    """
    if created:
        broadcast_notification_via_ws(instance)
