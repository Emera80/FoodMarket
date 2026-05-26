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

---

## 🚚 Gestion des Frais de Livraison

Les frais de livraison sont désormais centralisés côté Backend pour garantir une cohérence parfaite entre le tunnel de commande, l'espace administrateur et les factures PDF générées.

### 1. Configuration (Backend)
La valeur est définie dans `backend/core/settings.py` via la variable `DELIVERY_FEE`. 
- Pour modifier les frais, changez cette valeur en Python (ex: `DELIVERY_FEE = 6.000`).
- La vue PDF récupère automatiquement cette valeur pour l'affichage.

### 2. Exposition API
Un endpoint dédié a été créé : `GET /api/orders/delivery-fee/`. 
- Il renvoie la valeur brute configurée.
- Le front-end interroge cet endpoint au chargement du tunnel de commande (`useCheckoutFlow.js`).

### 3. Synchronisation
Le mécanisme de `localStorage` utilisé précédemment côté Admin est conservé pour l'interface mais la source de vérité pour le calcul réel et la facture reste le Backend.

---

## ⚡ Synchronisation en Temps Réel (Polling)

Pour offrir une expérience fluide et réactive sans nécessiter de rafraîchissement manuel de la page, l'application utilise une stratégie de **Polling Intelligent**.

### 1. Pourquoi le Polling ?
Bien que les WebSockets (via Django Channels) soient une alternative pour le "vrai" temps réel, le Polling a été choisi pour sa simplicité d'implémentation et sa robustesse dans l'environnement actuel, tout en répondant au besoin de mise à jour automatique des données.

### 2. Fréquences de rafraîchissement
Les données sont mises à jour en arrière-plan selon des intervalles adaptés à leur criticité :
- **Commandes Client (`useOrderHistory`)** : 10 secondes (Suivi de livraison prioritaire).
- **Commandes Admin (`useAdminOrders`)** : 15 secondes (Gestion logistique réactive).
- **Tableau de Bord (`useAdminDashboard`)** : 30 secondes (Statistiques et indicateurs).
- **Gestion Utilisateurs (`useAdminUsers`)** : 60 secondes (Données moins volatiles).

### 3. Expérience Utilisateur (UX)
- **Background Fetch** : Les mises à jour automatiques ne déclenchent pas de spinner de chargement global pour ne pas interrompre le travail de l'utilisateur.
- **Optimistic UI** : Lors d'un changement de statut manuel, l'interface est mise à jour instantanément avant même la confirmation du serveur.

---

## 📄 Téléchargement de Fichiers Binaires (Blob & Object URL)

La plateforme permet le téléchargement de factures PDF générées dynamiquement par le backend. Ce processus repose sur une gestion spécifique des données binaires côté client.

### 1. La Requête de Type "Blob"
Par défaut, une requête API (via Axios) tente de parser la réponse en JSON. Pour les fichiers (PDF, Images), nous spécifions `responseType: 'blob'`. 
- **Le Blob (Binary Large Object)** : C'est un objet représentant des données brutes immuables. Dans notre cas, il s'agit du contenu brut du PDF envoyé par Django.

### 2. La Conversion en URL Utilisable
Le navigateur ne peut pas "lire" directement un objet Blob dans la mémoire JavaScript pour le télécharger. Nous utilisons `window.URL.createObjectURL(blob)`.
- **Object URL** : Cela génère une URL temporaire de type `blob:http://localhost:3000/...`. Cette URL sert d'identifiant unique pointant vers le fichier stocké dans la RAM du navigateur.

### 3. Le Déclenchement du Téléchargement
Pour forcer le téléchargement sans ouvrir le fichier dans un nouvel onglet :
1. On crée un élément `<a>` invisible en mémoire.
2. On lui assigne l'URL du blob.
3. On utilise l'attribut `download="nom_du_fichier.pdf"`.
4. On déclenche un `.click()` programmatiquement.

### 4. Gestion de la Mémoire (RAM)
C'est l'étape la plus critique. Chaque `createObjectURL` réserve de la mémoire qui n'est **pas** libérée automatiquement par le Garbage Collector tant que la page est ouverte. 
- Nous utilisons `window.URL.revokeObjectURL(url)` immédiatement après le clic pour libérer les ressources et éviter les fuites de mémoire (Memory Leaks).

### Hook Réutilisable : `useDownloadInvoice.js`
Toute cette logique est centralisée dans un hook personnalisé, permettant d'ajouter une fonction de téléchargement n'importe où dans l'application avec gestion des états de chargement (`loading`) et des alertes (`toast`).
