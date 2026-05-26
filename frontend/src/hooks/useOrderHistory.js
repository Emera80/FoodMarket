/**
 * useOrderHistory.js
 * -----------------
 * Hook personnalisé gérant l'affichage de l'historique des commandes côté client.
 * 
 * Ce hook centralise la récupération des données, la gestion de l'état d'expansion 
 * des détails de commande, et fournit des utilitaires de formatage pour l'interface utilisateur.
 * Il assure également une vérification de sécurité de base sur l'authentification.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Hook useOrderHistory
 * @returns {Object} Un ensemble d'états et de fonctions utilitaires pour l'historique.
 */
export function useOrderHistory() {
  const navigate = useNavigate();

  // --- ÉTATS ---
  /** @type {number|null} ID de la commande dont le détail est actuellement ouvert (Accordéon). */
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  /** @type {Array} Liste des commandes de l'utilisateur. */
  const [commandes, setCommandes]             = useState([]);
  /** @type {Array} Cache local des restaurants pour résoudre les noms par ID. */
  const [restaurants, setRestaurants]         = useState([]);
  /** @type {Array} Cache local des plats pour résoudre les noms par ID dans les lignes de commande. */
  const [plats, setPlats]                     = useState([]);
  /** @type {boolean} État de chargement initial. */
  const [loading, setLoading]                 = useState(true);

  /**
   * Fonction de récupération des données, extraite pour être réutilisable.
   */
  const fetchHistorique = async () => {
    // 1. Vérification de la présence du token de session.
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Veuillez vous connecter pour voir votre historique.');
      navigate('/login');
      return;
    }

    try {
      // 2. Récupération croisée des données (Commandes + Référentiels).
      const [cmdRes, restRes, platsRes] = await Promise.all([
        api.get('/orders/commandes/'),
        api.get('/catalog/restaurants/'),
        api.get('/catalog/plats/'),
      ]);

      // Stockage des résultats (gestion de la pagination backend incluse).
      setCommandes(cmdRes.data.results || cmdRes.data);
      setRestaurants(restRes.data.results || restRes.data);
      setPlats(platsRes.data.results || platsRes.data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      toast.error("Impossible de charger l'historique des commandes.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effet de cycle de vie : Se déclenche au montage.
   * Récupère l'intégralité des données nécessaires à l'affichage de l'historique.
   */
  useEffect(() => {
    fetchHistorique();

    // Mise en place d'un polling léger (toutes les 10 secondes) pour mettre à jour
    // les statuts de commande sans action utilisateur, réduisant la latence perçue
    // entre l'admin et le client.
    const interval = setInterval(fetchHistorique, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  // --- GESTIONNAIRES D'ÉVÉNEMENTS ---

  /**
   * Bascule l'état d'expansion d'une commande (effet accordéon).
   * @param {number} id - L'identifiant de la commande à ouvrir ou fermer.
   */
  const toggleOrder = (id) => setExpandedOrderId(prev => prev === id ? null : id);

  // --- UTILITAIRES DE FORMATAGE ---

  /**
   * Résout le nom d'un restaurant à partir de son identifiant numérique.
   * @param {number} id - ID du restaurant.
   * @returns {string} Le nom du restaurant ou une valeur par défaut.
   */
  const getRestaurantName = (id) => {
    const rest = restaurants.find(r => r.id === id);
    return rest ? rest.nom : 'Restaurant inconnu';
  };

  /**
   * Résout le nom d'un plat à partir de son identifiant numérique.
   * @param {number} id - ID du plat.
   * @returns {string} Le nom du plat ou une valeur par défaut.
   */
  const getPlatName = (id) => {
    const plat = plats.find(p => p.id === id);
    return plat ? plat.nom : 'Plat inconnu';
  };

  /**
   * Formate une date ISO en chaîne lisible (ex: 12 mai 2024).
   * @param {string} dateString - La date brute du backend.
   * @returns {string} La date formatée selon la locale française.
   */
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Exposition de l'API du hook vers les composants (ex: OrderHistoryPage).
  return {
    loading,
    commandes, expandedOrderId,
    toggleOrder,
    getRestaurantName, getPlatName, formatDate,
  };
}
