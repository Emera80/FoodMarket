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

        Logique d'identification et de sécurité :
        1. L'ID utilisateur et le Rôle sont extraits de la Query String.
        2. Abonnement au canal personnel (user_{id}) pour toutes les notifications ciblées.
        3. Restriction : Seuls les utilisateurs ayant le rôle 'admin' sont abonnés au groupe
           global 'admin_notifications'. Cela empêche les clients de recevoir des alertes de gestion.
        """
        try:
            # Extraction des paramètres de connexion.
            query_params = self.scope['query_string'].decode('utf-8')
            params = dict(x.split('=') for x in query_params.split('&') if '=' in x)
            
            self.user_id = params.get('user_id')
            self.user_role = params.get('role', 'client')
            
            groups_to_add = []
            
            # 1. Abonnement au canal personnel (Recommandé pour tous).
            if self.user_id:
                self.user_group = f"user_{self.user_id}"
                groups_to_add.append(self.user_group)
            else:
                self.user_group = None

            # 2. Sécurisation : Seuls les admins accèdent au flux administratif global.
            if self.user_role == 'admin':
                self.admin_group = 'admin_notifications'
                groups_to_add.append(self.admin_group)
            else:
                self.admin_group = None

            # Enregistrement dans la couche Redis.
            for group in groups_to_add:
                await self.channel_layer.group_add(group, self.channel_name)

            await self.accept()

            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'status': 'success',
                'role_detected': self.user_role,
                'message': f'Connecté au bus ({self.user_role})'
            }))

        except Exception as e:
            print(f"[WS-AUTH-ERR] Échec de connexion : {e}")
            await self.close()

    async def disconnect(self, close_code):
        """
        Nettoyage des abonnements lors de la déconnexion.
        """
        if hasattr(self, 'user_group') and self.user_group:
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        
        if hasattr(self, 'admin_group') and self.admin_group:
            await self.channel_layer.group_discard(self.admin_group, self.channel_name)

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