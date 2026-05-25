
import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack

# On importe les routes WebSockets qu'on vient de créer
import catalog.routing # <-- Assure-toi que "catalog" est le bon nom de ton app

# 1. Importations nécessaires pour le routage des WebSockets
# ProtocolTypeRouter va inspecter le type de la requête entrante (HTTP ou WebSocket)
from channels.routing import ProtocolTypeRouter, URLRouter

# On indique à Django quel fichier de paramètres utiliser
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# 2. L'application HTTP standard (ce qui gère tes requêtes d'API actuelles)
django_asgi_app = get_asgi_application()

# 3. Le routeur principal
application = ProtocolTypeRouter({
    # Si la requête est du HTTP classique (ex: un GET sur /api/catalog/),
    # on la passe au gestionnaire Django habituel.
    "http": django_asgi_app,

    # On utilise URLRouter directement sans AuthMiddlewareStack pour l'instant
    # car le frontend utilise JWT et non les sessions Django.
    "websocket": URLRouter(
        catalog.routing.websocket_urlpatterns
    ),
})