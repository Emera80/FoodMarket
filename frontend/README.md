# Food Market - Documentation Technique & Architecture

Ce projet est une application complète de livraison de repas (Food Delivery) construite avec une architecture moderne découplant le Frontend (React/Vite) du Backend (Django/REST).

## 🚀 Architecture Globale

L'application repose sur un écosystème à trois piliers :
1.  **Frontend (React/Tailwind)** : Interface réactive gérant l'état complexe (Panier, Tunnel de commande) et les interactions temps réel.
2.  **Backend (Django REST Framework)** : API robuste gérant l'authentification JWT, l'ORM (Menu, Commandes, Restaurants) et la logique métier.
3.  **Temps Réel (Django Channels / Redis)** : Bus de communication asynchrone pour les notifications instantanées via WebSockets.

---

## 🔔 Architecture des Notifications Temps Réel

Le système de notifications est conçu pour être "invisible" pour le développeur de fonctionnalités :

### 1. Le Déclencheur (Backend)
Lorsqu'une action métier survient (ex: nouvelle commande), le service concerné (`orders/services.py`) crée simplement une instance du modèle `Notification` dans la base de données.

### 2. Le Pont (Signaux & Services)
Un signal Django `post_save` (`catalog/signals.py`) intercepte la création. Il appelle `broadcast_notification_via_ws`, qui bascule du monde synchrone (ORM) vers le monde asynchrone (ASGI/Channels). 

### 3. La Diffusion (WebSocket Consumer)
Le `AdminNotificationConsumer` (`catalog/consumers.py`) reçoit l'événement et l'expédie via le bus Redis vers le frontend. Le routage est intelligent :
-   **Canal Privé** : `user_{id}` pour les notifications personnelles (statut de commande).
-   **Canal Global** : `admin_notifications` pour les alertes de gestion (nouveau message client).

### 4. La Réception (Frontend)
Le composant `NotificationBell.jsx` maintient la connexion. À chaque message, il :
-   Affiche un **Toast** (React Hot Toast) pour une alerte immédiate.
-   Incrémente la pastille rouge de la cloche.
-   Met à jour dynamiquement la liste sans recharger la page.

---

## 💳 Gestion du Tunnel Stripe

Le paiement est intégré via le **Stripe Payment Element**, offrant une sécurité maximale (SCA/3D Secure) et une flexibilité totale.

### Flux de données :
1.  **Initialisation** : Au chargement de l'étape de paiement, le frontend appelle `/api/catalog/create-payment-intent/`.
2.  **Backend** : Django contacte Stripe pour générer un `client_secret`. Ce jeton identifie la transaction sans jamais faire transiter de données sensibles par nos serveurs.
3.  **Validation Frontend** : Le composant `StripePayement.jsx` utilise ce secret pour afficher le formulaire sécurisé de Stripe.
4.  **Confirmation** : Une fois le bouton "Payer" cliqué, Stripe traite la transaction. En cas de succès, le frontend déclenche l'enregistrement final de la commande dans notre base de données Django.

---

## 🛡️ Authentification & Rôles

L'application utilise des jetons **JWT (JSON Web Tokens)** stockés dans le `localStorage`.
-   **Client** : Accès au catalogue, panier, historique des commandes et messagerie support.
-   **Admin** : Accès au dashboard de gestion, modification des menus, traitement des commandes et réponses aux messages.

Le rôle est vérifié à la fois côté Frontend (pour masquer/afficher les menus) et côté Backend (via des `Permissions` DRF) pour garantir la sécurité.
