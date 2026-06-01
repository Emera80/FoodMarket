# DS-TECH-WEB - Plateforme de Commande de Repas en Ligne

DS-TECH-WEB est une application web moderne de type SaaS permettant la commande et la livraison de repas. Le projet est construit avec une architecture découplée utilisant **Django** pour le backend et **React** pour le frontend.

## 🚀 Fonctionnalités Clés

### 👤 Espace Client
- **Navigation & Recherche** : Catalogue de restaurants et de plats avec filtrage par catégorie.
- **Gestion du Panier** : Ajout/Suppression de produits avec mise à jour dynamique.
- **Paiement Sécurisé** : Intégration complète avec **Stripe** pour les paiements par carte.
- **Suivi de Commandes** : Historique des commandes et suivi du statut de livraison.
- **Notifications Temps Réel** : Alertes instantanées via WebSockets lors du changement de statut d'une commande.
- **Avis & Notes** : Système de feedback sur les restaurants partenaires.

### 🛡️ Dashboard Administration
- **Statistiques Avancées** : Visualisation des ventes, revenus et nouveaux utilisateurs via des graphiques (Recharts).
- **Gestion du Catalogue** : CRUD complet sur les restaurants, plats et catégories.
- **Gestion des Commandes** : Suivi global des flux, mise à jour des statuts et génération de factures.
- **Facturation PDF** : Génération automatique de factures professionnelles au format PDF.
- **Gestion des Utilisateurs** : Contrôle des accès et rôles (Admin/Client).
- **Centre de Notifications** : Envoi de messages aux clients et gestion des demandes de contact.

## 🛠️ Stack Technique

### Backend
- **Framework** : Django & Django REST Framework (DRF)
- **Communication Temps Réel** : Django Channels & Redis (WebSockets)
- **Base de données** : PostgreSQL / MySQL (via Psycopg2/Mysqlclient)
- **Authentification** : JWT (SimpleJWT)
- **Tâches & Utilitaires** : 
  - `xhtml2pdf` / `reportlab` : Génération de documents PDF.
  - `Stripe API` : Gestion des transactions.
  - `WhiteNoise` : Gestion des fichiers statiques.

### Frontend
- **Framework** : React 19 (Vite)
- **Styling** : Tailwind CSS 4
- **Animations** : Framer Motion
- **Icônes** : Lucide React
- **Gestion d'état & API** : Axios, React Context/Hooks
- **Graphiques** : Recharts
- **Notifications UI** : React Hot Toast

## 📦 Installation et Configuration

### Prérequis
- Python 3.10+
- Node.js 18+
- Redis (ou accès Upstash) pour les notifications temps réel

### 📥 Clonage du Projet
Pour récupérer l'intégralité du code source sur votre machine locale :
```bash
git clone https://github.com/votre-username/DS-TECH-WEB.git
cd DS-TECH-WEB
```

### ⚙️ Configuration du Backend
1. Naviguer vers le dossier backend :
   ```bash
   cd backend
   ```
2. Créer et activer un environnement virtuel :
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Sur Windows: .venv\Scripts\activate
   ```
3. Installer les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
4. Configurer les variables d'environnement (`.env`) avec les valeurs réelles :
   ```env
   SECRET_KEY='votre_cle_secrete_django'
   STRIPE_SECRET_KEY='sk_test_votre_cle_stripe_secrete'
   DATABASE_URL='postgresql://utilisateur:mot_de_passe@votre_hote:port/votre_db'
   REDIS_URL='rediss://default:votre_token@votre_hote_redis:6379'
   DEBUG=True
   ```
5. Appliquer les migrations et lancer le serveur :
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### 💻 Configuration du Frontend
1. Naviguer vers le dossier frontend :
   ```bash
   cd ../frontend
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Configurer les variables d'environnement (`.env`) :
   ```env
   VITE_STRIPE_PUBLIC_KEY='pk_test_votre_cle_stripe_publique'
   VITE_API_URL=https://votre-backend-url.com
   VITE_WS_URL=wss://votre-backend-url.com
   ```
4. Lancer le projet en mode développement :
   ```bash
   npm run dev
   ```

## 🚀 Déploiement

Le projet est configuré pour un déploiement Cloud moderne et scalable :
- **Backend** : Hébergé sur **Render** (gestion des WebSockets via Gunicorn/Daphne).
- **Frontend** : Déployé sur **Vercel** pour une performance optimale et un edge caching efficace.
- **Base de données** : **Supabase** (PostgreSQL) pour une haute disponibilité et une gestion simplifiée.
- **Cache & Message Broker** : **Upstash** (Redis) pour gérer les notifications temps réel de manière serverless.

## 🧠 Défis Techniques & Optimisations

### ⚡ Performance & Latence
L'un des défis majeurs a été de maintenir des temps de réponse applicatifs extrêmement bas sans utiliser de système de cache agressif au niveau applicatif. Cela a nécessité :
- **Optimisation de l'ORM Django** : Réécriture approfondie des vues pour éradiquer le problème des requêtes en N+1 via une utilisation intensive de `select_related` et `prefetch_related`.
- **Indexation SQL** : Indexation minutieuse des clés étrangères dans PostgreSQL (Supabase) pour accélérer les jointures complexes lors de la compilation des paniers d'achat et du calcul des statistiques.

### 📱 Interface & Expérience Utilisateur
- **Responsivité Critique** : Un travail important a été fourni sur la responsivité (Tailwind CSS 4) pour garantir que le dashboard administratif complexe et le tunnel d'achat restent fluides sur mobile.
- **Synchronisation Temps Réel** : Mise en place d'une architecture robuste avec Django Channels pour notifier les clients instantanément lors des changements de statut de commande, sans rechargement de page.

## 📐 Architecture du Projet

Le projet suit une architecture propre et modulaire :
- **Backend** : Divisé en plusieurs applications Django (`accounts`, `catalog`, `orders`) pour une meilleure séparation des responsabilités. Utilisation de **Services** et **Managers** pour encapsuler la logique métier.
- **Frontend** : Organisation par composants (`components`), pages (`pages`) et services (`services`), favorisant la réutilisation du code.

## 📝 Auteur
- **DS-TECH** - [Votre Portefolio](https://votre-lien.com)

---
*Ce projet a été réalisé dans le cadre d'un développement Fullstack moderne mettant l'accent sur l'expérience utilisateur et la performance.*
