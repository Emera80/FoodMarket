import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Utensils, Users,
  Settings, LogOut, Menu, X,
  Store, Home, MessageSquare, MonitorSmartphone
} from 'lucide-react';

import NotificationBell from '../pages/AdminSide/NotificationBell';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Sur tablette (md), la sidebar est fermée par défaut ; sur desktop (lg+), elle est ouverte.
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <>
      {/* --- MOBILE BLOCKER (< 768px) --- */}
      <div className="flex md:hidden min-h-screen bg-gray-950 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center">
            <MonitorSmartphone size={40} className="text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-white font-black text-2xl">Accès restreint</h2>
            <p className="text-gray-400 font-medium leading-relaxed max-w-xs">
              L'espace administrateur nécessite au minimum une <span className="text-orange-400 font-bold">tablette</span> ou un ordinateur pour être utilisé.
            </p>
          </div>
          <div className="px-4 py-2 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Résolution minimale : 768px</p>
          </div>
        </div>
      </div>

      {/* --- LAYOUT ADMIN (>= 768px) --- */}
    <div className="hidden md:flex min-h-screen bg-gray-50">
      
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
        <header className="bg-white border-b border-gray-200 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          {/* Bouton hamburger visible sur tablette (sidebar fermée) */}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors lg:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-4 md:gap-6">
            <NotificationBell />
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-gray-900 leading-none">Administrateur</p>
                <p className="text-[10px] font-bold text-orange-600 uppercase mt-1">Super Admin</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-black">
                A
              </div>
            </div>
          </div>
        </header>

        {/* C'est ici que les pages admin s'afficheront */}
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
    </>
  );
}