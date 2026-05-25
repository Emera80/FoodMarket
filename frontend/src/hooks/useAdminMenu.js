import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export function useAdminMenu() {
  const [plats, setPlats]           = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchPlats(); }, []);

  const fetchPlats = async () => {
    setLoading(true);
    try {
      const [platsRes, restsRes] = await Promise.all([
        api.get('/catalog/plats/'),
        api.get('/catalog/restaurants/'),
      ]);
      setPlats(platsRes.data.results || platsRes.data);
      setRestaurants(restsRes.data.results || restsRes.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantCuisine = (restId) => {
    const restaurant = restaurants.find(r => r.id === restId);
    return restaurant ? restaurant.type_cuisine : 'Non défini';
  };

  const executeDelete = async (id) => {
    try {
      await api.delete(`/catalog/plats/${id}/`);
      toast.success('Plat retiré du catalogue');
      setPlats(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const confirmDelete = (plat) => {
    toast((t) => (
      React.createElement('div', { className: 'flex flex-col gap-3' },
        React.createElement('div', { className: 'flex items-center gap-2 text-gray-900' },
          React.createElement(AlertTriangle, { className: 'text-red-500', size: 20 }),
          React.createElement('span', { className: 'font-bold text-gray-900 text-sm' },
            `Supprimer "${plat.nom}" ?`
          )
        ),
        React.createElement('div', { className: 'flex justify-end gap-2' },
          React.createElement('button', {
            onClick: () => toast.dismiss(t.id),
            className: 'px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'
          }, 'Annuler'),
          React.createElement('button', {
            onClick: () => { toast.dismiss(t.id); executeDelete(plat.id); },
            className: 'px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm'
          }, 'Confirmer')
        )
      )
    ), { duration: 5000, position: 'top-center' });
  };

  const toggleAvailability = async (plat) => {
    try {
      await api.patch(`/catalog/plats/${plat.id}/`, { is_available: !plat.is_available });
      toast.success(`${plat.nom} est maintenant ${plat.is_available ? 'indisponible' : 'disponible'}`);
      fetchPlats();
    } catch {
      toast.error('Erreur de modification');
    }
  };

  const filteredPlats = plats.filter(p =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    plats, loading,
    searchTerm, setSearchTerm,
    getRestaurantCuisine,
    confirmDelete,
    toggleAvailability,
    filteredPlats,
  };
}
