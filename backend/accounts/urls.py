from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import UtilisateurViewSet, update_profile, change_password

router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('profile/update/', update_profile),
    path('profile/change-password/', change_password),

]