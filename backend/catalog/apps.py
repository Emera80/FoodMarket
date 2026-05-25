from django.apps import AppConfig


class CatalogConfig(AppConfig):
    name = 'catalog'

    def ready(self):
        # Enregistre les signaux (post_save Notification → WebSocket)
        import catalog.signals  # noqa: F401
