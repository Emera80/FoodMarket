
import React, { useState, useEffect } from 'react';
import { useCart } from "../context/CartContext";
import NotificationBell from '../pages/AdminSide/NotificationBell'; // Ajuste le chemin selon ton arborescence
import { 
  Search, 
  ShoppingCart, 
  User, 
  Cherry,
  LogOut,
  ShieldCheck, // <-- Icône pour l'admin
  MessageSquare // <-- NOUVEAU : Icône pour les messages
} from 'lucide-react';
import logoImg from '../assets/foodCategoriesImg/logo.png';
import { Link, useNavigate } from 'react-router-dom'; 
import api from '../services/api';

const API_BASE_URL = 'http://127.0.0.1:8000';

const normalizeAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('data:') || avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  return `${API_BASE_URL}${avatar}`;
};

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart(); 
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [userName, setUserName] = useState(localStorage.getItem('username') || 'Client');
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('user_avatar') || null);
  
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'client');

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
      setUserName(localStorage.getItem('username') || 'Client');
      setUserAvatar(localStorage.getItem('user_avatar') || null);
      setUserRole(localStorage.getItem('user_role') || 'client');
    };

    const handleAvatarChange = () => {
      setUserAvatar(localStorage.getItem('user_avatar') || null);
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('avatarChange', handleAvatarChange);

    // Au chargement, on récupère les infos (Avatar ET Rôle)
    if (isLoggedIn && (!userAvatar || !localStorage.getItem('user_role'))) {
        api.get('/accounts/utilisateurs/').then(res => {
            const users = res.data.results || res.data;
            const user = users[0] || users;

            // On sauvegarde l'avatar
            if (user.avatar) {
                const normalizedAvatar = normalizeAvatarUrl(user.avatar);
                setUserAvatar(normalizedAvatar);
                localStorage.setItem('user_avatar', normalizedAvatar);
            }

            // ON SAUVEGARDE LE RÔLE
            if (user.role) {
                setUserRole(user.role);
                localStorage.setItem('user_role', user.role);
            }
        }).catch(err => console.error(err));
    }

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('avatarChange', handleAvatarChange);
    };
  }, [isLoggedIn, userAvatar]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_avatar');
    localStorage.removeItem('user_role'); // On nettoie le rôle
    
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <header className='header flex justify-between items-center px-10 py-5 sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm '>
      <div className="logoDiv shrink-0">
          <div className='logo flex items-center gap-2'>
            <Link to="/">
              <img src={logoImg} className='w-12 h-12 object-contain' alt="logo" />
            </Link>
            <h2 className='logoText text-2xl font-extrabold flex items-baseline'>
              <Link to="/">F</Link>
              <span className='text-orange-500 self-center mx-0.5'><Cherry size={24} strokeWidth={3} /></span>
              <Link to="/">d Market</Link>
            </h2>
          </div>
      </div>

      <nav className='navLink hidden lg:block'>
        <ul className='flex gap-2 items-center'>
          <li><Link to="/#categories" className='Link-item text-center block'>Categories</Link></li>
          <li><Link to="/plats" className='Link-item text-center block'>Plats</Link></li>
          <li><Link to="/#about" className='Link-item text-center block text-nowrap'>À propos</Link></li>
          <li><Link to="/#ventes" className='Link-item text-center block text-nowrap'>Meilleurs ventes</Link></li>
          <li><Link to="/restaurants" className='Link-item text-center block text-nowrap'>Restaurants</Link></li>
          <li><Link to="/#contact" className='Link-item text-center block'>Contact</Link></li>
        </ul>
      </nav>

      <div className='headerIcon flex items-center gap-4'>

        <div onClick={() => setIsCartOpen(true)} className="relative headerIconShop rounded-full bg-orange-500 p-2.5 text-white hover:bg-orange-600 cursor-pointer transition-colors shadow-lg shadow-orange-200">
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        
        {/* --- LA CLOCHE DE NOTIFICATION POUR LE CLIENT ET L'ADMIN --- */}
        {isLoggedIn && <NotificationBell />}

        <div className="headerIconLogin">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              
              {/* --- LE BOUTON SECRET ADMIN --- */}
              {userRole === 'admin' && (
                <Link to="/admin" className='flex items-center gap-2 rounded-xl bg-purple-100 text-purple-700 px-4 py-2 font-bold hover:bg-purple-200 transition-colors border border-purple-200 shadow-sm' title="Espace Administration">
                  <ShieldCheck size={18} />
                  <span className='hidden xl:inline text-sm'>Admin</span>
                </Link>
              )}

              {/* --- NOUVEAU : MENU DÉROULANT DU PROFIL --- */}
              <div className="relative group">
                {/* Le bouton principal du profil */}
                <div className='userIcon flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200'>
                    {userAvatar ? (
                       <img src={userAvatar} alt="Profil" className="w-6 h-6 rounded-full object-cover border border-gray-300" />
                    ) : (
                       <User size={18} className="text-gray-500" />
                    )}
                    <span className='hidden sm:inline text-sm'>{userName}</span>
                </div>

                {/* Le menu qui apparaît au survol */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 origin-top-right">
                    
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <User size={18} /> Mon Profil
                    </Link>
                    
                    {/* LE FAMEUX BOUTON DES MESSAGES */}
                    <Link to="/profile/messages" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-t border-gray-50 transition-colors">
                        <MessageSquare size={18} /> Mes Messages
                    </Link>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 border-t border-gray-50 transition-colors">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
              </div>

            </div>
          ) : (
            <Link to="/login" className='userIcon flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white font-bold hover:bg-gray-800 transition-colors cursor-pointer'>
                <User size={18} />
                <span className='hidden sm:inline text-sm'>Se connecter</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;