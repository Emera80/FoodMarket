import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AdminNotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket asynchrone pour la gestion des notifications en temps réel.

    Ce composant agit comme un serveur de "Push" pour le frontend React. Il maintient
    une connexion persistante et écoute les messages provenant du Channel Layer de Django.

    Cycle de vie :
    1. Connexion (connect) : L'utilisateur s'abonne à son groupe personnel et/ou au groupe admin.
    2. Réception (send_admin_notification) : Intercepte les événements du serveur et les transmet au client.
    3. Déconnexion (disconnect) : Nettoie les abonnements pour libérer les ressources Redis.

    👉 Voir l'architecture globale dans README.md, section "Architecture des Notifications Temps Réel".
    """

    async def connect(self):
        """
        Initialise la connexion WebSocket et gère l'abonnement aux groupes de diffusion.

        Logique d'identification :
        L'ID utilisateur est extrait de la Query String (ex: ?user_id=12).
        En production, cette identification devrait être sécurisée via un jeton JWT
        dans les en-têtes ou via le middleware d'authentification de Channels.
        """
        try:
            # Extraction de l'ID utilisateur pour le routage ciblé.
            query_params = self.scope['query_string'].decode('utf-8')
            self.user_id = query_params.split('user_id=')[-1] if 'user_id=' in query_params else None
            
            groups_to_add = []
            
            # Abonnement au canal personnel de l'utilisateur.
            if self.user_id:
                self.user_group = f"user_{self.user_id}"
                groups_to_add.append(self.user_group)
            else:
                self.user_group = None

            # Abonnement systématique au groupe administratif pour centraliser les alertes de gestion.
            self.admin_group = 'admin_notifications'
            groups_to_add.append(self.admin_group)

            # Enregistrement de la connexion dans la couche Redis (Channel Layer).
            for group in groups_to_add:
                await self.channel_layer.group_add(
                    group,
                    self.channel_name
                )

            # Finalisation du handshake WebSocket.
            await self.accept()

            # Message de confirmation de protocole envoyé au frontend.
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'status': 'success',
                'message': 'Connecté au bus de notifications Food Market.'
            }))

        except Exception as e:
            # En cas d'erreur critique, on ferme la connexion pour éviter les états incohérents.
            print(f"[WS-AUTH-ERR] Échec de connexion : {e}")
            await self.close()

    async def disconnect(self, close_code):
        """
        Libère proprement les ressources lors de la fermeture de la socket.
        Retire l'instance actuelle des groupes Redis pour éviter les fuites de mémoire.
        """
        if hasattr(self, 'user_group') and self.user_group:
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )
        
        await self.channel_layer.group_discard(
            'admin_notifications',
            self.channel_name
        )

    async def send_admin_notification(self, event):
        """
        Handler appelé automatiquement par Django Channels lors d'une diffusion de groupe.

        Cette méthode fait la passerelle entre les événements internes (dictionnaires Python)
        et le flux sortant vers le navigateur (JSON).

        Args:
            event (dict): Contient la clé 'valeur' avec les données de la notification.
        """
        # Récupération des données sérialisées de la notification.
        notification_data = event['valeur']

        # Transmission asynchrone vers le frontend React.
        await self.send(text_data=json.dumps({
            'type': 'nouvelle_notification',
            'payload': notification_data
        }))