import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useOrderHistory() {
  const navigate = useNavigate();

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [commandes, setCommandes]             = useState([]);
  const [restaurants, setRestaurants]         = useState([]);
  const [plats, setPlats]                     = useState([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const fetchHistorique = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Veuillez vous connecter pour voir votre historique.');
        navigate('/login');
        return;
      }
      try {
        const [cmdRes, restRes, platsRes] = await Promise.all([
          api.get('/orders/commandes/'),
          api.get('/catalog/restaurants/'),
          api.get('/catalog/plats/'),
        ]);
        setCommandes(cmdRes.data.results   || cmdRes.data);
        setRestaurants(restRes.data.results || restRes.data);
        setPlats(platsRes.data.results     || platsRes.data);
      } catch (error) {
        console.error('Erreur chargement historique:', error);
        toast.error("Impossible de charger l'historique des commandes.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistorique();
  }, [navigate]);

  const toggleOrder = (id) => setExpandedOrderId(prev => prev === id ? null : id);

  const getRestaurantName = (id) => {
    const rest = restaurants.find(r => r.id === id);
    return rest ? rest.nom : 'Restaurant inconnu';
  };

  const getPlatName = (id) => {
    const plat = plats.find(p => p.id === id);
    return plat ? plat.nom : 'Plat inconnu';
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return {
    loading,
    commandes, expandedOrderId,
    toggleOrder,
    getRestaurantName, getPlatName, formatDate,
  };
}
