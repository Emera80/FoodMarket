import React, { useState, useEffect } from 'react';
import { Bell, Trash2, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from "date-fns/locale/fr";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
const API_BASE_URL = 'http://127.0.0.1:8000'; // centralisation de l'URL pour le WS

export default function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- 1. USE-EFFECT CLASSIQUE (HTTP) ---
  // Chargement de l'historique des notifications au démarrage
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await axios.get('http://127.0.0.1:8000/api/catalog/notifications/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // On s'assure d'avoir un tableau et on trie par date décroissante
        const notifs = Array.isArray(response.data) ? response.data : (response.data.results || []);

        const sortedNotifs = notifs.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );

        setNotifications(sortedNotifs);

        // Comptage des non lues
        const count = sortedNotifs.filter(n => !n.est_lu).length;
        setUnreadCount(count);
      } catch (error) {
        console.error('Erreur notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // ============================================================
  // --- 2. 🚨 NOUEAU USE-EFFECT TEMPS RÉEL (WEBSOCKETS) 🚨 ---
  // Connexion au salon de notifications admin de Django Channels
  // ============================================================
  useEffect(() => {
    // A. On ne se connecte que si l'utilisateur a un token (est connecté)
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // B. Définition de l'URL WebSocket (on remplace http:// par ws://)
    const wsUrl = `ws://127.0.0.1:8000/ws/admin-notifications/`;
    const ws = new WebSocket(wsUrl);

    // C. Événement : Connexion établie avec succès
    ws.onopen = () => {
      console.log('✅ NotificationBell: Connecté au flux temps réel (WebSocket)');
    };

    // D. Événement : Réception d'un message depuis le serveur Django
    // D. Événement : Réception d'un message depuis le serveur Django
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'nouvelle_notification') {
          const payload = data.payload;
          console.log('🔔 Nouvelle notification reçue en temps réel:', payload);

          // --- AJOUT DU TOAST ICI ---
          toast.success(`Nouveau message : ${payload.titre}`, {
            duration: 5000,
            position: 'top-right',
            icon: '🔔',
          });
          // --------------------------

          const newNotifForUI = {
            id: `ws-${Date.now()}`,
            titre: payload.titre,
            description: payload.description,
            created_at: new Date().toISOString(),
            est_lu: false,
            type: 'MESSAGE',
            url_redirection: payload.id_message ? '/admin/messages' : '/'
          };

          setNotifications(prevNotifs => [newNotifForUI, ...prevNotifs]);
          setUnreadCount(prevCount => prevCount + 1);
        }
      } catch (err) {
        console.error('Erreur lors du traitement du message WS', err);
      }
    };

    // E. Événement : Si le serveur ferme la connexion ou erreur
    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log('❌ NotificationBell: Flux temps réel déconnecté (WebSocket)');
      }
      // Connexion refusée silencieusement si le serveur n'est pas disponible
    };

    ws.onerror = (error) => {
      console.error('❌ NotificationBell: Erreur WebSocket:', error);
    };

    // F. Fonction de nettoyage (Cleanup)
    // Quand on quitte la page ou le composant est détruit, on "raccroche" la ligne WS
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []); // [] = On se connecte une seule fois au montage du composant

  // ... (Reste de tes fonctions existantes inchangé) ...

  const normalizeUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    // Pour les médias locaux
    return `http://127.0.0.1:8000${avatar}`;
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);

    if (!notif.est_lu) {
      // Marquage comme lu en base de données (HTTP)
      try {
        const token = localStorage.getItem('access_token');
        await axios.post(`http://127.0.0.1:8000/api/catalog/notifications/${notif.id}/marquer_lu/`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Mise à jour locale du state
        setNotifications(notifications.map(n =>
          n.id === notif.id ? { ...n, est_lu: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Erreur marquage lu:", error);
      }
    }

    // Redirection
    if (notif.url_redirection) {
      if (location.pathname === notif.url_redirection) {
        navigate(0); // Recharge si on y est déjà
      } else {
        navigate(notif.url_redirection);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/catalog/notifications/marquer_tout_lu/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mise à jour locale
      setNotifications(notifications.map(n => ({ ...n, est_lu: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur marquage tout lu:", error);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation(); // Évite de trigger le clic sur la notif
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/catalog/notifications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Si la notif supprimée était non lue, on décrémente le compteur
      const deletedNotif = notifications.find(n => n.id === id);
      if (deletedNotif && !deletedNotif.est_lu) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Mise à jour locale
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Erreur suppression notification:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-xl transition-all ${isOpen ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900">Notifications</h3>
                <p className="text-sm font-bold text-gray-400 mt-1">Vous avez {unreadCount} notifications non lues</p>
              </div>
              <div className='flex items-center gap-2'>
                  <button onClick={markAllAsRead} className='p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50' title='Tout marquer comme lu'>
                      <CheckCircle2 size={18}/>
                  </button>
                  <button onClick={() => setIsOpen(false)} className='p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100'>
                      <X size={18}/>
                  </button>
              </div>
            </div>

            <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100">
              {loading ? (
                <div className="p-10 text-center text-sm font-bold text-gray-400">Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center">
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4'>
                        <Bell size={32}/>
                    </div>
                    <p className="text-sm font-bold text-gray-500">Aucune notification pour le moment.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-6 border-b border-gray-100 flex items-start gap-4 hover:bg-gray-50 cursor-pointer transition-colors relative group ${!n.est_lu ? 'bg-orange-50/50' : ''}`}
                  >
                    {!n.est_lu && (
                        <div className='absolute left-0 top-0 bottom-0 w-1 bg-orange-500'></div>
                    )}

                    <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                      n.type === 'COMMANDE' ? 'bg-blue-100 text-blue-600' :
                      n.type === 'MESSAGE' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {/* Icône basée sur le type ou l'avatar utilisateur */}
                      {n.utilisateur_details?.avatar ? (
                          <img src={normalizeUrl(n.utilisateur_details.avatar)} alt="User" className='w-8 h-8 rounded-full object-cover'/>
                      ) : (
                          <Bell size={20} />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-black text-gray-900 leading-snug">{n.titre}</p>
                      <p className="text-sm font-bold text-gray-600 line-clamp-2">{n.description}</p>
                      <p className="text-[10px] font-bold text-gray-400 pt-1 flex items-center gap-1.5">
                        {n.created_at && formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                        {n.utilisateur_details && `• par ${n.utilisateur_details.nom}`}
                      </p>
                    </div>

                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-all p-1.5 bg-white rounded-lg shadow-sm border border-gray-100" title='Supprimer'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 5 && (
              <div className="p-4 bg-gray-50 text-center">
                <button
                  onClick={() => navigate('/admin/notifications')}
                  className="text-sm font-black text-orange-600 hover:text-orange-700"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}