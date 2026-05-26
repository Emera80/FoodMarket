"""
orders/services.py
------------------
Couche de services dédiée à la gestion du cycle de vie des commandes.

Ce module orchestre les interactions complexes liées aux commandes, notamment :
- La notification multi-destinataire lors d'une nouvelle vente.
- Le suivi des changements de statut de livraison.
- L'interface avec le module de notification global.

L'utilisation d'une couche service ici permet de découpler la logique métier
des vues Django, facilitant ainsi la maintenance et l'évolution du tunnel de commande.
"""

def notify_new_order(commande, user) -> None:
    """
    Pilote l'envoi des notifications consécutives à la création d'une commande.

    Cette fonction assure la communication vers deux cibles distinctes :
    1. Administrateurs : Alerte sur l'arrivée d'une nouvelle commande à préparer.
    2. Client : Envoi d'une confirmation de réception pour rassurer l'utilisateur.

    Args:
        commande (Commande): L'instance de la commande venant d'être créée.
        user (Utilisateur): Le client ayant passé la commande.
    """
    # Importations locales pour éviter les dépendances circulaires entre modules.
    from catalog.models import Notification
    from accounts.models import Utilisateur

    # 1. Notification du pôle administratif.
    admins = Utilisateur.objects.filter(role='admin')
    for admin in admins:
        Notification.objects.create(
            user=admin,
            titre="Nouvelle commande !",
            description=f"La commande #{commande.id} a été passée par {user.nom}. À traiter rapidement.",
            url_redirection="/admin/orders",
        )

    # 2. Notification de confirmation pour le client.
    Notification.objects.create(
        user=user,
        titre="Nouvelle commande",
        description=f"Votre commande #{commande.id} est bien enregistrée. Merci de votre confiance !",
        url_redirection="/orderhistory",
    )


def notify_status_change(commande) -> None:
    """
    Informe le client de l'évolution logistique de sa commande.

    Cette fonction est généralement appelée lors de la mise à jour du champ
    `statut_livraison` par un administrateur.

    Args:
        commande (Commande): L'instance de commande dont le statut a évolué.
    """
    from catalog.models import Notification

    # Création d'une notification ciblée sur le propriétaire de la commande.
    Notification.objects.create(
        user=commande.user,
        titre="Mise à jour de votre commande",
        description=(
            f"Bonne nouvelle ! Votre commande #{commande.id} est maintenant : "
            f"{commande.get_statut_livraison_display().lower()}."
        ),
        url_redirection="/orderhistory",
    )
