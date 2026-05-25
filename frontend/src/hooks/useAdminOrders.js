import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const STATUTS_CONFIG = {
  'en_attente':    { label: 'En attente',     color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  'confirmee':     { label: 'Confirmée',       color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  'en_preparation':{ label: 'En preparation',  color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500' },
  'en_livraison':  { label: 'En livraison',    color: 'bg-indigo-100 text-indigo-700',dot: 'bg-indigo-500' },
  'livree':        { label: 'Livrée',          color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'annulee':       { label: 'Annulée',         color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
};

export function useAdminOrders() {
  const [commandes, setCommandes]             = useState([]);
  const [restaurants, setRestaurants]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [statusFilter, setStatusFilter]       = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('');
  const [dateFilter, setDateFilter]           = useState('');
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);

  const FRAIS_LIVRAISON = parseFloat(localStorage.getItem('deliveryFee')) || 7.000;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, restRes] = await Promise.all([
        api.get('/orders/commandes/'),
        api.get('/catalog/restaurants/'),
      ]);
      setCommandes(ordRes.data.results || ordRes.data);
      setRestaurants(restRes.data.results || restRes.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commandeId, newStatus) => {
    try {
      await api.patch(`/orders/commandes/${commandeId}/`, { statut_livraison: newStatus });
      toast.success('Statut mis à jour');
      setCommandes(prev =>
        prev.map(cmd => cmd.id === commandeId ? { ...cmd, statut_livraison: newStatus } : cmd)
      );
      if (selectedOrder?.id === commandeId) {
        setSelectedOrder(prev => ({ ...prev, statut_livraison: newStatus }));
      }
    } catch {
      toast.error('Erreur de mise à jour');
    }
  };

  const openModal = (order) => { setSelectedOrder(order); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRestaurantFilter('');
    setDateFilter('');
  };

  const filteredCommandes = commandes.filter(cmd => {
    const searchMatch =
      String(cmd.id).includes(searchTerm) ||
      (cmd.user_name && cmd.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const statusMatch     = statusFilter     ? cmd.statut_livraison === statusFilter         : true;
    const restaurantMatch = restaurantFilter ? String(cmd.restaurant) === String(restaurantFilter) : true;
    const cmdDate         = new Date(cmd.date).toISOString().split('T')[0];
    const dateMatch       = dateFilter       ? cmdDate === dateFilter                         : true;
    return searchMatch && statusMatch && restaurantMatch && dateMatch;
  });

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
