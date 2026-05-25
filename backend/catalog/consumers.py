import json
from channels.generic.websocket import AsyncWebsocketConsumer


class AdminNotificationConsumer(AsyncWebsocketConsumer):
    # 1. Cette méthode est appelée quand React tente de se connecter au WebSocket
    async def connect(self):
        try:
            # On définit le nom du "salon" (le groupe) où ce websocket va écouter.
            self.group_name = 'admin_notifications'

            # On ajoute cette connexion spécifique (self.channel_name) au groupe
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )

            # On accepte la connexion WebSocket
            await self.accept()
        except Exception as e:
            print(f"Error in connect: {e}")
            await self.close()

        # Optionnel : On envoie un petit message de bienvenue pour confirmer que ça marche
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connecté au flux de notifications temps réel !'
        }))

    # 2. Cette méthode est appelée quand React se déconnecte (fermeture de l'onglet, etc.)
    async def disconnect(self, close_code):
        # On retire proprement la connexion du groupe pour ne pas envoyer de messages dans le vide
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # 3. Notre méthode sur-mesure pour envoyer une notification au client React
    # "event" contient le dictionnaire de données envoyé par Django via Redis
    async def send_admin_notification(self, event):
        # On extrait les données utiles (le titre, le message, etc.)
        notification_data = event['valeur']

        # On convertit le tout en JSON et on l'envoie dans le tuyau WebSocket vers React
        await self.send(text_data=json.dumps({
            'type': 'nouvelle_notification',
            'payload': notification_data
        }))