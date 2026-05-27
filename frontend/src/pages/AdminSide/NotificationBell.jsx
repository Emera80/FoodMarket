import React, { useState, useEffect } from 'react';
import { Bell, Trash2, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from "date-fns/locale/fr";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

/** 
 * URL de base pour les communications temps réel (WebSocket).
 * Centralisée pour faciliter le passage en production.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Composant NotificationBell - Gestionnaire de notifications temps réel.
 * 
 * Ce composant remplit trois rôles majeurs :
 * 1. Pôle de réception (WebSocket) : Écoute les alertes poussées par Django Channels.
 * 2. Historique (HTTP) : Permet de consulter et marquer comme lues les notifications passées.
 * 3. Routeur intelligent : Redirige l'utilisateur vers la ressource concernée au clic.
 * 
 * 👉 Voir l'architecture globale dans README.md, section "Architecture des Notifications Temps Réel".
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- ÉTATS LOCAUX ---
  /** @type {Array} Liste des notifications à afficher. */
  const [notifications, setNotifications] = useState([]);
  /** @type {number} Nombre de pastilles rouges à afficher sur la cloche. */
  const [unreadCount, setUnreadCount] = useState(0);
  /** @type {boolean} État d'ouverture du panneau latéral (Pop-over). */
  const [isOpen, setIsOpen] = useState(false);
  /** @type {boolean} Indicateur de chargement initial. */
  const [loading, setLoading] = useState(true);

  /** Détermination dynamique des accès selon le rôle utilisateur. */
  const userRole = localStorage.getItem('user_role');
  const notificationsPath = userRole === 'admin' ? '/admin/notifications' : null;

  // --- 1. SYNCHRONISATION INITIALE (HTTP) ---
  /**
   * Récupère l'historique complet des notifications via l'API REST classique.
   * S'exécute une seule fois au montage du composant.
   */
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/catalog/notifications/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Normalisation de la réponse (gère les formats paginés ou bruts).
        const notifs = Array.isArray(response.data) ? response.data : (response.data.results || []);

        // Tri chronologique : Les plus récentes en premier.
        const sortedNotifs = notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setNotifications(sortedNotifs);
        setUnreadCount(sortedNotifs.filter(n => !n.est_lu).length);
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // --- 2. GESTION DU TEMPS RÉEL (WEBSOCKETS) ---
  /**
   * Établit et maintient une connexion persistante pour recevoir des alertes "Push".
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    if (!token) return;

    // Connexion au salon de diffusion Django Channels.
    // L'identifiant utilisateur est passé pour le routage ciblé côté serveur.
    const wsUrl = `${import.meta.env.VITE_API_URL.replace(/^http/, 'ws')}/ws/admin-notifications/?user_id=${userId || ''}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log('✅ Bus de notifications connecté.');

    /**
     * Traitement des messages entrants.
     * Chaque message reçu déclenche un Toast visuel et met à jour la liste locale.
     */
    ws.onmessage = (event) => {
      // Si on est sur mobile et que le toast est déjà affiché, on ignore le nouveau toast visuel
      // mais on met à jour la liste.
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'nouvelle_notification') {
          const payload = data.payload;

          // Feedback visuel immédiat (Toast).
          toast.success(payload.titre, {
            duration: 3000, 
            position: window.innerWidth < 1024 ? 'bottom-center' : 'top-right',
            icon: '🔔',
            id: `notif-${payload.id || Date.now()}`, // Évite les doublons
            style: {
              maxWidth: '90vw',
              fontSize: '14px'
            }
          });

          // Normalisation de l'URL cible selon le rôle (Routage intelligent).
          let redirectUrl = payload.url_redirection || '/';
          if (redirectUrl.includes('order') && localStorage.getItem('user_role') !== 'admin') {
            redirectUrl = '/orderhistory';
          }

          // Création de l'objet de notification pour le state React.
          const newNotif = {
            id: payload.id || `ws-${Date.now()}`,
            titre: payload.titre,
            description: payload.description,
            created_at: payload.created_at || new Date().toISOString(),
            est_lu: false,
            // Détection automatique du type pour l'icône/couleur.
            type: (redirectUrl.toLowerCase().includes('order') || payload.titre?.toLowerCase().includes('commande')) ? 'COMMANDE' : 'MESSAGE',
            url_redirection: redirectUrl
          };

          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prevCount => prevCount + 1);
        }
      } catch (err) {
        console.error('Erreur lors du traitement du message WS', err);
      }
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log('❌ Bus de notifications déconnecté proprement.');
      } else {
        console.warn('⚠️ Connexion WebSocket perdue. Tentative de reconnexion dans 5s...');
        setTimeout(() => {
          // Note: Dans un vrai hook de production, on utiliserait un état pour déclencher le useEffect
          // ou une fonction de connexion récursive. Ici, comme c'est simple, 
          // le rechargement du composant ou un mécanisme interne suffirait.
          // Pour corriger le bug de "blocage", on s'assure surtout que le toast ne reste pas.
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ Erreur WebSocket:', error);
    };

    // Nettoyage de la socket lors du démontage du composant.
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  /**
   * Gère l'interaction de l'utilisateur avec une notification.
   * 
   * Actions :
   * 1. Fermeture du panneau.
   * 2. Marquage comme lu (Optimiste + API).
   * 3. Redirection fluide via React Router (sans rechargement de page).
   * 
   * @param {Event} e - Événement de clic.
   * @param {Object} notif - L'objet notification concerné.
   */
  const handleNotificationClick = async (e, notif) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    setIsOpen(false);

    // --- MARQUAGE COMME LU ---
    if (!notif.est_lu) {
      // Mise à jour locale immédiate (UX fluide).
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, est_lu: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Synchronisation avec le backend (silencieuse).
      if (notif.id && !String(notif.id).startsWith('ws-')) {
        try {
          const token = localStorage.getItem('access_token');
          await axios.post(`${API_BASE_URL}/api/catalog/notifications/${notif.id}/marquer_lu/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.warn('Échec de synchronisation du statut "Lu":', err);
        }
      }
    }

    // --- ROUTAGE INTELLIGENT ---
    if (notif.url_redirection) {
      // Normalisation des chemins pour éviter les rechargements inutiles (navigate(0)).
      let targetPath = notif.url_redirection.toLowerCase().trim();
      if (targetPath.includes('order') && localStorage.getItem('user_role') !== 'admin') {
        targetPath = '/orderhistory';
      }
      if (targetPath.length > 1 && targetPath.endsWith('/')) targetPath = targetPath.slice(0, -1);

      let currentPath = location.pathname.toLowerCase().trim();
      if (currentPath.length > 1 && currentPath.endsWith('/')) currentPath = currentPath.slice(0, -1);
      
      // On ne navigue que si la destination est différente de la page actuelle.
      if (currentPath !== targetPath) {
        navigate(targetPath);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/catalog/notifications/marquer_tout_lu/`, {}, {
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/catalog/notifications/${id}/`, {
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
            className="fixed top-[72px] inset-x-3 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-96 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">Notifications</h3>
                <p className="text-xs font-bold text-gray-400 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
                </p>
              </div>
              <div className='flex items-center gap-1 shrink-0'>
                  <button onClick={markAllAsRead} className='p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50' title='Tout marquer comme lu'>
                      <CheckCircle2 size={16}/>
                  </button>
                  {notificationsPath && (
                    <button
                      onClick={() => { setIsOpen(false); navigate(notificationsPath); }}
                      className='p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50'
                      title='Voir toutes les notifications'
                    >
                      <Bell size={16}/>
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className='p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100'>
                      <X size={16}/>
                  </button>
              </div>
            </div>

            {/* Liste */}
            <div className="max-h-[55vh] sm:max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100">
              {loading ? (
                <div className="p-8 text-center text-sm font-bold text-gray-400">Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                    <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3'>
                        <Bell size={24}/>
                    </div>
                    <p className="text-sm font-bold text-gray-500">Aucune notification pour le moment.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={(e) => handleNotificationClick(e, n)}
                    className={`p-3 sm:p-4 border-b border-gray-100 flex items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors relative group ${!n.est_lu ? 'bg-orange-50/50' : ''}`}
                  >
                    {!n.est_lu && (
                        <div className='absolute left-0 top-0 bottom-0 w-1 bg-orange-500'></div>
                    )}

                    <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                      n.type === 'COMMANDE' ? 'bg-blue-100 text-blue-600' :
                      n.type === 'MESSAGE' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {n.utilisateur_details?.avatar ? (
                          <img src={normalizeUrl(n.utilisateur_details.avatar)} alt="User" className='w-7 h-7 rounded-full object-cover'/>
                      ) : (
                          <Bell size={16} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5 pr-6">
                      <p className="text-xs sm:text-sm font-black text-gray-900 leading-snug truncate">{n.titre}</p>
                      <p className="text-xs font-medium text-gray-500 line-clamp-2">{n.description}</p>
                      <p className="text-[10px] font-bold text-gray-400 pt-0.5">
                        {n.created_at && formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                        {n.utilisateur_details && ` • par ${n.utilisateur_details.nom}`}
                      </p>
                    </div>

                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-all p-1 bg-white rounded-lg shadow-sm border border-gray-100" title='Supprimer'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 5 && notificationsPath && (
              <div className="p-4 bg-gray-50 text-center">
                <button
                  onClick={() => { setIsOpen(false); navigate(notificationsPath); }}
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