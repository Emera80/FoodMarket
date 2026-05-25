import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle2, ShoppingBag, MessageSquare, Filter, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://127.0.0.1:8000';

const normalizeUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  return `${API_BASE_URL}${avatar}`;
};

const TYPE_CONFIG = {
  COMMANDE: { label: 'Commande', icon: <ShoppingBag size={18} />, bg: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500' },
  MESSAGE:  { label: 'Message',  icon: <MessageSquare size={18} />, bg: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' },
  DEFAULT:  { label: 'Système',  icon: <Bell size={18} />, bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Toutes'); // Toutes | Non lues | COMMANDE | MESSAGE

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }

        const response = await axios.get(`${API_BASE_URL}/api/catalog/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const notifs = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setNotifications(notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        console.error('Erreur chargement notifications:', err);
        toast.error('Impossible de charger les notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE_URL}/api/catalog/notifications/marquer_tout_lu/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
      toast.success('Toutes les notifications marquées comme lues.');
    } catch {
      toast.error('Erreur lors du marquage.');
    }
  };

  const markAsRead = async (notif) => {
    if (notif.est_lu) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE_URL}/api/catalog/notifications/${notif.id}/marquer_lu/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, est_lu: true } : n));
    } catch {
      toast.error('Erreur lors du marquage.');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE_URL}/api/catalog/notifications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification supprimée.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'Non lues') return !n.est_lu;
    if (filter === 'COMMANDE') return n.type === 'COMMANDE';
    if (filter === 'MESSAGE') return n.type === 'MESSAGE';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.est_lu).length;

  const FILTERS = ['Toutes', 'Non lues', 'COMMANDE', 'MESSAGE'];

  return (
    <div className="space-y-6">

      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-black text-gray-900">Toutes les notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                {unreadCount} non lues
              </span>
            )}
          </div>
          <p className="text-gray-400 font-medium text-sm ml-12">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''} au total
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 font-bold rounded-xl transition-colors border border-green-200"
          >
            <CheckCircle2 size={18} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* --- FILTRES --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Filter size={16} className="text-gray-400 shrink-0" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            {f === 'Toutes' ? `Toutes (${notifications.length})` :
             f === 'Non lues' ? `Non lues (${unreadCount})` :
             f === 'COMMANDE' ? `Commandes (${notifications.filter(n => n.type === 'COMMANDE').length})` :
             `Messages (${notifications.filter(n => n.type === 'MESSAGE').length})`}
          </button>
        ))}
      </div>

      {/* --- LISTE --- */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-bold">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
              <Bell size={32} />
            </div>
            <p className="text-gray-400 font-bold text-lg">Aucune notification</p>
            <p className="text-gray-300 text-sm font-medium mt-1">
              {filter !== 'Toutes' ? 'Essayez un autre filtre.' : 'Tout est tranquille pour le moment.'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((n, index) => {
              const typeConf = TYPE_CONFIG[n.type] || TYPE_CONFIG.DEFAULT;
              return (
                <div
                  key={n.id}
                  className={`relative flex items-start gap-4 p-5 sm:p-6 transition-colors group cursor-pointer
                    ${index < filtered.length - 1 ? 'border-b border-gray-100' : ''}
                    ${!n.est_lu ? 'bg-orange-50/40 hover:bg-orange-50' : 'hover:bg-gray-50/60'}
                  `}
                  onClick={() => markAsRead(n)}
                >
                  {/* Barre latérale non-lu */}
                  {!n.est_lu && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full"></div>
                  )}

                  {/* Icône / Avatar */}
                  <div className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${typeConf.bg}`}>
                    {n.utilisateur_details?.avatar ? (
                      <img
                        src={normalizeUrl(n.utilisateur_details.avatar)}
                        alt="User"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      typeConf.icon
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${typeConf.bg}`}>
                            {typeConf.label}
                          </span>
                          {!n.est_lu && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                          )}
                        </div>
                        <p className="font-black text-gray-900 text-sm leading-snug mt-1">{n.titre}</p>
                        <p className="text-gray-500 text-sm font-medium mt-0.5 line-clamp-2">{n.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 font-bold">
                          <span>
                            {n.created_at
                              ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })
                              : ''}
                          </span>
                          {n.utilisateur_details && (
                            <>
                              <span className="text-gray-200">•</span>
                              <span>par {n.utilisateur_details.nom || n.utilisateur_details.username}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.est_lu && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAsRead(n); }}
                            title="Marquer comme lu"
                            className="p-2 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          title="Supprimer"
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- PIED DE PAGE --- */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
          {filtered.length} notification{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
