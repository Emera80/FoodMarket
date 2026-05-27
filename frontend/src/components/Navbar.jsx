
import React, { useState, useEffect } from 'react';
import { useCart } from "../context/CartContext";
import NotificationBell from '../pages/AdminSide/NotificationBell';
import {
  Search,
  ShoppingCart,
  User,
  Cherry,
  LogOut,
  ShieldCheck,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';
import logoImg from '../assets/foodCategoriesImg/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    if (isLoggedIn && (!userAvatar || !localStorage.getItem('user_role'))) {
        api.get('/accounts/utilisateurs/').then(res => {
            const users = res.data.results || res.data;
            const user = users[0] || users;

            if (user.avatar) {
                const normalizedAvatar = normalizeAvatarUrl(user.avatar);
                setUserAvatar(normalizedAvatar);
                localStorage.setItem('user_avatar', normalizedAvatar);
            }

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
    localStorage.removeItem('user_role');
    window.dispatchEvent(new Event('authChange'));
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { to: '/#categories', label: 'Catégories' },
    { to: '/plats', label: 'Plats' },
    { to: '/#about', label: 'À propos' },
    { to: '/#ventes', label: 'Meilleurs ventes' },
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/#contact', label: 'Contact' },
  ];

  return (
    <>
      <header className='header flex justify-between items-center px-4 sm:px-10 py-4 sm:py-5 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm'>
        {/* Logo */}
        <div className="logoDiv shrink-0">
          <div className='logo flex items-center gap-2'>
            <Link to="/">
              <img src={logoImg} className='w-10 h-10 sm:w-12 sm:h-12 object-contain' alt="logo" />
            </Link>
            <h2 className='logoText text-xl sm:text-2xl font-extrabold flex items-baseline'>
              <Link to="/">F</Link>
              <span className='text-orange-500 self-center mx-0.5'><Cherry size={20} strokeWidth={3} /></span>
              <Link to="/">d Market</Link>
            </h2>
          </div>
        </div>

        {/* Navigation desktop */}
        <nav className='navLink hidden lg:block'>
          <ul className='flex gap-2 items-center'>
            {navLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} className='Link-item text-center block text-nowrap'>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Icônes à droite */}
        <div className='headerIcon flex items-center gap-2 sm:gap-4'>

          {/* Panier */}
          <div onClick={() => setIsCartOpen(true)} className="relative headerIconShop rounded-full bg-orange-500 p-2 sm:p-2.5 text-white hover:bg-orange-600 cursor-pointer transition-colors shadow-lg shadow-orange-200">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </div>

          {/* Cloche de notification */}
          {isLoggedIn && <NotificationBell />}

          {/* Profil / Connexion — desktop uniquement */}
          <div className="headerIconLogin hidden sm:block">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <Link to="/admin" className='flex items-center gap-2 rounded-xl bg-purple-100 text-purple-700 px-3 py-2 font-bold hover:bg-purple-200 transition-colors border border-purple-200 shadow-sm' title="Espace Administration">
                    <ShieldCheck size={18} />
                    <span className='hidden xl:inline text-sm'>Admin</span>
                  </Link>
                )}

                <div className="relative group">
                  <div className='userIcon flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200'>
                    {userAvatar ? (
                       <img src={userAvatar} alt="Profil" className="w-6 h-6 rounded-full object-cover border border-gray-300" />
                    ) : (
                       <User size={18} className="text-gray-500" />
                    )}
                    <span className='hidden md:inline text-sm'>{userName}</span>
                  </div>

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 origin-top-right">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <User size={18} /> Mon Profil
                    </Link>
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
                <span className='hidden md:inline text-sm'>Se connecter</span>
              </Link>
            )}
          </div>

          {/* Hamburger — mobile/tablette */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ===== MENU MOBILE ===== */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl flex flex-col overflow-y-auto">

            {/* Header du drawer */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className='text-lg font-black text-gray-900'>Menu</h2>
              <button onClick={closeMobileMenu} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Profil utilisateur */}
            {isLoggedIn ? (
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-orange-100 overflow-hidden border-2 border-orange-200 flex items-center justify-center text-orange-600 font-black">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{userName}</p>
                    {userRole === 'admin' && (
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Admin</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 border-b border-gray-100">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white font-bold rounded-xl"
                >
                  <User size={18} /> Se connecter
                </Link>
              </div>
            )}

            {/* Liens de navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className="flex items-center px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions utilisateur connecté */}
            {isLoggedIn && (
              <div className="p-4 border-t border-gray-100 space-y-1">
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-700 font-bold bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <ShieldCheck size={18} /> Espace Administration
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  <User size={18} /> Mon Profil
                </Link>
                <Link
                  to="/profile/messages"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  <MessageSquare size={18} /> Mes Messages
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
