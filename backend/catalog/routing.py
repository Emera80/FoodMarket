from django.urls import re_path
from . import consumers

# C'est exactement comme urlpatterns, mais pour les WebSockets
websocket_urlpatterns = [
    # Si React se connecte à ws://127.0.0.1:8000/ws/admin-notifications/
    # Alors on le confie à notre AdminNotificationConsumer
    re_path(r'ws/admin-notifications/$', consumers.AdminNotificationConsumer.as_asgi()),
]