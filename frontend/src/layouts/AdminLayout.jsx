import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Users, 
  Settings, LogOut, Search, Menu, X, 
  Store, Home, MessageSquare // <-- Ajout de MessageSquare ici !
} from 'lucide-react';

// Import de notre nouveau composant de notifications
// (Ajuste le chemin selon l'emplacement exact de ton composant dans tes dossiers)
import NotificationBell from '../pages/AdminSide/NotificationBell'; 

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Tableau de bord', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Restaurants', path: '/admin/restaurants', icon: <Store size={20} /> },
    { name: 'Commandes', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Menu & Plats', path: '/admin/menu', icon: <Utensils size={20} /> },
    { name: 'Utilisateurs', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Paramètres', path: '/admin/settings', icon: <Settings size={20} /> },
    { name: 'Messages', path: '/admin/messages', icon: <MessageSquare size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* --- SIDEBAR --- */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'} fixed h-full z-50`}>
        <div className="p-6 flex items-center justify-between">
          <h2 className={`font-black text-xl text-orange-500 overflow-hidden transition-all ${isSidebarOpen ? 'w-auto' : 'w-0'}`}>
            FOOD<span className="text-white">ADMIN</span>
          </h2>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-800 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                location.pathname === item.path 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`overflow-hidden transition-all ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* SECTION DU BAS : Retour au site + Déconnexion */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          
          <Link to="/" className="flex items-center gap-4 px-4 py-4 w-full text-gray-400 font-bold hover:bg-gray-800 hover:text-white rounded-2xl transition-all">
            <Home size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Retour au site</span>
          </Link>

          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-4 w-full text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Déconnexion</span>
          </button>

        </div>
      </aside>

      {/* --- ZONE DE CONTENU PRINCIPAL --- */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        
        {/* Topbar Interne */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-xl w-96">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Rechercher une commande..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* === INTÉGRATION DE LA NOUVELLE CLOCHE === */}
            <NotificationBell />
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-900 leading-none">Administrateur</p>
                <p className="text-[10px] font-bold text-orange-600 uppercase mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-black">
                A
              </div>
            </div>
          </div>
        </header>

        {/* C'est ici que les pages admin s'afficheront */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}