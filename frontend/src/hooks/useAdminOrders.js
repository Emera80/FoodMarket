/**
 * useAdminOrders.js
 * ----------------
 * Hook personnalisé dédié à la gestion des commandes pour l'interface d'administration.
 * 
 * Ce hook centralise toute la logique de consultation, de filtrage et de mise à jour 
 * du statut des commandes passées sur la plateforme. Il permet aux administrateurs
 * de suivre le flux logistique en temps réel.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Configuration visuelle des statuts de livraison.
 * Définit les labels, les couleurs de fond (Tailwind) et les indicateurs visuels.
 */
export const STATUTS_CONFIG = {
  'en_attente':    { label: 'En attente',     color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  'confirmee':     { label: 'Confirmée',       color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  'en_preparation':{ label: 'En preparation',  color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500' },
  'en_livraison':  { label: 'En livraison',    color: 'bg-indigo-100 text-indigo-700',dot: 'bg-indigo-500' },
  'livree':        { label: 'Livrée',          color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'annulee':       { label: 'Annulée',         color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

/**
 * Hook useAdminOrders
 * @returns {Object} Un ensemble d'états et de fonctions pour gérer les commandes admins.
 */
export function useAdminOrders() {
  // --- ÉTATS DES DONNÉES ---
  /** @type {Array} Liste brute des commandes récupérées du backend. */
  const [commandes, setCommandes]             = useState([]);
  /** @type {Array} Liste des restaurants pour alimenter les filtres. */
  const [restaurants, setRestaurants]         = useState([]);
  /** @type {boolean} État de chargement global pour l'affichage des squelettes/spinners. */
  const [loading, setLoading]                 = useState(true);

  // --- ÉTATS DE FILTRAGE ---
  /** @type {string} Terme de recherche (ID commande ou nom client). */
  const [searchTerm, setSearchTerm]           = useState('');
  /** @type {string} Filtre par statut de livraison (ex: 'en_preparation'). */
  const [statusFilter, setStatusFilter]       = useState('');
  /** @type {string} Filtre par ID de restaurant. */
  const [restaurantFilter, setRestaurantFilter] = useState('');
  /** @type {string} Filtre par date précise (format YYYY-MM-DD). */
  const [dateFilter, setDateFilter]           = useState('');

  // --- ÉTATS DE L'INTERFACE (MODALE) ---
  /** @type {Object|null} La commande actuellement sélectionnée pour affichage détaillé. */
  const [selectedOrder, setSelectedOrder]     = useState(null);
  /** @type {boolean} Contrôle l'ouverture/fermeture de la modale de détails. */
  const [isModalOpen, setIsModalOpen]         = useState(false);

  /** @constant {number} Frais de livraison par défaut, récupérés du localStorage ou valeur statique. */
  const FRAIS_LIVRAISON = parseFloat(localStorage.getItem('deliveryFee')) || 7.000;

  /**
   * Effet d'initialisation : charge les données au montage du composant.
   */
  useEffect(() => { fetchData(); }, []);

  /**
   * Récupère de manière asynchrone les commandes et les restaurants.
   * Utilise Promise.all pour paralléliser les appels API et optimiser le temps de réponse.
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, restRes] = await Promise.all([
        api.get('/orders/commandes/'),
        api.get('/catalog/restaurants/'),
      ]);
      // On gère la pagination potentielle du backend (results) ou le format array simple.
      setCommandes(ordRes.data.results || ordRes.data);
      setRestaurants(restRes.data.results || restRes.data);
    } catch {
      toast.error('Erreur de chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour le statut d'une commande via un appel PATCH.
   * Cette fonction met également à jour l'état local pour un feedback instantané (Optimistic UI).
   * 
   * @param {number} commandeId - L'identifiant de la commande à modifier.
   * @param {string} newStatus - Le nouveau code statut (ex: 'livree').
   */
  const handleStatusChange = async (commandeId, newStatus) => {
    try {
      // Appel partiel au backend pour modifier uniquement le statut.
      await api.patch(`/orders/commandes/${commandeId}/`, { statut_livraison: newStatus });
      toast.success('Statut mis à jour avec succès');
      
      // Mise à jour de la liste locale sans recharger toute la page.
      setCommandes(prev =>
        prev.map(cmd => cmd.id === commandeId ? { ...cmd, statut_livraison: newStatus } : cmd)
      );
      
      // Si l'utilisateur regarde actuellement le détail de cette commande, on met aussi à jour la modale.
      if (selectedOrder?.id === commandeId) {
        setSelectedOrder(prev => ({ ...prev, statut_livraison: newStatus }));
      }
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  /**
   * Ouvre la modale de détail pour une commande spécifique.
   * @param {Object} order - L'objet commande complet.
   */
  const openModal = (order) => { setSelectedOrder(order); setIsModalOpen(true); };

  /** Ferme la modale de détail. */
  const closeModal = () => setIsModalOpen(false);

  /** Réinitialise tous les filtres à leur valeur par défaut. */
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRestaurantFilter('');
    setDateFilter('');
  };

  /**
   * Logique de filtrage dynamique (Computed State).
   * Cette liste est recalculée à chaque fois qu'un filtre ou la liste des commandes change.
   * 
   * On combine les critères : Recherche textuelle + Statut + Restaurant + Date.
   */
  const filteredCommandes = commandes.filter(cmd => {
    // 1. Recherche par ID ou Nom Client (insensible à la casse)
    const searchMatch =
      String(cmd.id).includes(searchTerm) ||
      (cmd.user_name && cmd.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 2. Filtre par statut (si sélectionné)
    const statusMatch     = statusFilter     ? cmd.statut_livraison === statusFilter         : true;
    
    // 3. Filtre par restaurant (si sélectionné)
    const restaurantMatch = restaurantFilter ? String(cmd.restaurant) === String(restaurantFilter) : true;
    
    // 4. Filtre par date (conversion ISO pour comparaison stricte de la partie date)
    const cmdDate         = new Date(cmd.date).toISOString().split('T')[0];
    const dateMatch       = dateFilter       ? cmdDate === dateFilter                         : true;
    
    return searchMatch && statusMatch && restaurantMatch && dateMatch;
  });

  // Exposition de l'API publique du hook.
  return {
    commandes, restaurants, loading,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    restaurantFilter, setRestaurantFilter,
    dateFilter, setDateFilter,
    selectedOrder, isModalOpen,
    openModal, closeModal,
    handleStatusChange, resetFilters,
    filteredCommandes, FRAIS_LIVRAISON,
  };
}
