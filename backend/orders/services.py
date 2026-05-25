"""
orders/services.py
------------------
Couche Service de l'application orders.
Orchestre les notifications (admin + client) lors des événements de commande.
Les vues (views.py) appellent ces fonctions et se limitent au rôle HTTP.
"""


def notify_new_order(commande, user) -> None:
    """
    Déclenche deux notifications lors de la création d'une commande :
      - Une notification pour chaque administrateur (nouvelle commande à traiter).
      - Une notification de confirmation pour le client.
    """
    # Imports locaux pour éviter les imports circulaires
    # (orders <-> catalog seraient circulaires si importés au module top-level)
    from catalog.models import Notification
    from accounts.models import Utilisateur

    # Notification à tous les admins
    admins = Utilisateur.objects.filter(role='admin')
    for admin in admins:
        Notification.objects.create(
            user=admin,
            titre="Nouvelle commande !",
            description=f"Commande #{commande.id} reçue de {user.nom}",
            url_redirection="/admin/orders",
        )

    # Confirmation au client
    Notification.objects.create(
        user=user,
        titre="Commande confirmée",
        description=f"Votre commande #{commande.id} a été enregistrée avec succès.",
        url_redirection="/orderhistory",
    )


def notify_status_change(commande) -> None:
    """
    Notifie le client quand le statut de sa commande change.
    Appelé depuis CommandeViewSet.perform_update() après sauvegarde.
    """
    from catalog.models import Notification

    Notification.objects.create(
        user=commande.user,
        titre="Mise à jour de votre commande",
        description=(
            f"Votre commande #{commande.id} est maintenant : "
            f"{commande.get_statut_livraison_display()}"
        ),
        url_redirection="/orderhistory",
    )
