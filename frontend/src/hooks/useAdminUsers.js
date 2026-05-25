import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useAdminUsers() {
  const [users, setUsers]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedUser, setSelectedUser]     = useState(null);
  const [userOrders, setUserOrders]         = useState([]);
  const [loadingOrders, setLoadingOrders]   = useState(false);
  const [isModalOpen, setIsModalOpen]       = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounts/utilisateurs/');
      setUsers(response.data.results || response.data);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const openUserProfile = async (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setLoadingOrders(true);
    try {
      const response = await api.get(`/orders/commandes/?user=${user.id}`);
      setUserOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur historique:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const filteredUsers = users.filter(u =>
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    users, loading,
    searchTerm, setSearchTerm,
    selectedUser, userOrders, loadingOrders,
    isModalOpen,
    openUserProfile, closeModal,
    filteredUsers,
  };
}
