import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, Package, MessageSquare, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/catalog/notifications/');
      setNotifications(res.data.results || res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling 10s pour plus de réactivité
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.est_lu).length;

  const markAllRead = async () => {
    await api.post('/catalog/notifications/marquer_tout_lu/', {});
    fetchNotifications();
  };

  const handleNotifClick = async (notif) => {
    setIsOpen(false);
    
    // Marquer la notification individuelle comme lue
    try {
      await api.patch(`/catalog/notifications/${notif.id}/`, { est_lu: true });
      fetchNotifications();
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
    
    navigate(notif.url_redirection);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all relative">
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slideUp">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-900 text-sm">Notifications</h3>
            <button onClick={markAllRead} className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1 hover:underline">
              <CheckCheck size={12} /> Tout lire
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div 
                  key={n.id} onClick={() => handleNotifClick(n)}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-orange-50/50 transition-colors flex gap-3 ${!n.est_lu ? 'bg-orange-50/30' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    n.url_redirection.includes('orders') ? 'bg-blue-100 text-blue-600' : 
                    n.url_redirection.includes('messages') ? 'bg-purple-100 text-purple-600' : 
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {n.url_redirection.includes('orders') ? <Package size={18}/> : 
                     n.url_redirection.includes('orderhistory') ? <Package size={18}/> : 
                     <MessageSquare size={18}/>}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{n.titre}</p>
                    <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{n.description}</p>
                    <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">Il y a 2 min</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 text-xs font-bold italic">Aucune alerte.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}