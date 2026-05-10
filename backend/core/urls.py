
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    #les routes pour l'authentification JWT
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/catalog/', include('catalog.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/accounts/', include('accounts.urls')),
]

# AJOUTE CECI À LA FIN DU FICHIER :
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)