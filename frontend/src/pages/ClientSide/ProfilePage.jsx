// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useNavigate, Link } from 'react-router-dom';
// import { 
//   User, MapPin, CreditCard, Package, 
//   Lock, Save, Plus, Trash2, Camera, Wallet, ShoppingBag, ChevronRight, X, CheckCircle
// } from 'lucide-react';

// export default function ProfilePage() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('Informations');
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // Données utilisateur réelles provenant du Backend
//   const [userData, setUserData] = useState({ id: '', nom: '', email: '', telephone: '', adresse: '' });
//   const [initialEmail, setInitialEmail] = useState('');
  
//   // États pour les fonctionnalités
//   const [commandes, setCommandes] = useState([]);
//   const [stats, setStats] = useState({ totalDepense: 0, nbCommandes: 0 });
//   const [showAddCard, setShowAddCard] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem('access_token');
//       if (!token) { navigate('/login'); return; }

//       try {
//         const [userRes, orderRes] = await Promise.all([
//           axios.get(`${import.meta.env.VITE_API_URL}/api/accounts/utilisateurs/`, {
//             headers: { Authorization: `Bearer ${token}` }
//           }),
//           axios.get(`${import.meta.env.VITE_API_URL}/api/orders/commandes/`, {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ]);

//         // Mapping des données réelles
//         const user = userRes.data[0] || userRes.data;
//         setUserData({
//           id: user.id,
//           nom: user.nom || '',
//           email: user.email || '',
//           telephone: user.telephone || '',
//           adresse: user.adresse || ''
//         });
//         setInitialEmail(user.email);

//         const orders = orderRes.data.results || orderRes.data;
//         setCommandes(orders);
        
//         const total = orders.reduce((sum, ord) => sum + parseFloat(ord.total), 0);
//         setStats({ totalDepense: total, nbCommandes: orders.length });

//       } catch (error) {
//         toast.error("Erreur de synchronisation avec le serveur");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [navigate]);

//   // SAUVEGARDE GÉNÉRALE (Nom, Email, Tel, Adresse)
//   const handleUpdateProfile = async (e) => {
//     if (e) e.preventDefault();
//     setIsSubmitting(true);
//     const token = localStorage.getItem('access_token');

//     try {
//       await axios.patch(`${import.meta.env.VITE_API_URL}/api/accounts/utilisateurs/${userData.id}/`, userData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       // Si l'email a changé, on force la reconnexion
//       if (userData.email !== initialEmail) {
//         toast.success("Email modifié. Reconnexion requise...");
//         localStorage.clear();
//         setTimeout(() => {
//             window.location.href = '/login';
//         }, 1500);
//       } else {
//         toast.success("Informations enregistrées !");
//       }
//     } catch (error) {
//       toast.error("Erreur lors de la mise à jour");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-orange-600">Chargement...</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-6xl mx-auto">
        
//         {/* --- DASHBOARD STATS --- */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="md:col-span-1 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
//             <div className="relative mb-4">
//               <div className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-4xl font-black border-4 border-white shadow-xl">
//                 {userData.nom?.charAt(0).toUpperCase()}
//               </div>
//               <button className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all">
//                 <Camera size={16} />
//               </button>
//             </div>
//             <h2 className="text-xl font-black text-gray-900">{userData.nom}</h2>
//             <p className="text-gray-400 text-sm font-medium">{userData.email}</p>
//           </div>

//           <div className="bg-orange-600 p-8 rounded-[32px] shadow-lg flex items-center gap-6 text-white">
//             <div className="p-4 bg-white/20 rounded-2xl"><Wallet size={32} /></div>
//             <div>
//               <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">Dépenses</p>
//               <h3 className="text-3xl font-black">{stats.totalDepense.toFixed(3)} DT</h3>
//             </div>
//           </div>

//           <div className="bg-gray-900 p-8 rounded-[32px] shadow-lg flex items-center gap-6 text-white">
//             <div className="p-4 bg-white/10 rounded-2xl"><ShoppingBag size={32} /></div>
//             <div>
//               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Commandes</p>
//               <h3 className="text-3xl font-black">{stats.nbCommandes}</h3>
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* --- NAVIGATION --- */}
//           <div className="lg:w-72 flex flex-row lg:flex-col gap-2 overflow-x-auto">
//             {[
//               { id: 'Informations', icon: <User size={20} /> },
//               { id: 'Historique', icon: <Package size={20} /> },
//               { id: 'Adresses', icon: <MapPin size={20} /> },
//               { id: 'Paiement', icon: <CreditCard size={20} /> }
//             ].map(tab => (
//               <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
//                   activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm border border-gray-100 scale-105' : 'text-gray-400 hover:text-gray-600'
//                 }`}>
//                 {tab.icon} {tab.id}
//               </button>
//             ))}
//           </div>

//           {/* --- CONTENU --- */}
//           <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 min-h-[500px]">
            
//             {/* 1. INFORMATIONS GÉNÉRALES */}
//             {activeTab === 'Informations' && (
//               <form onSubmit={handleUpdateProfile} className="space-y-8 animate-fadeIn">
//                 <h3 className="text-2xl font-black text-gray-900">Paramètres du compte</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="md:col-span-2">
//                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom complet</label>
//                     <input type="text" value={userData.nom} onChange={(e) => setUserData({...userData, nom: e.target.value})}
//                       className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
//                     <input type="email" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})}
//                       className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Téléphone</label>
//                     <input type="tel" value={userData.telephone} onChange={(e) => setUserData({...userData, telephone: e.target.value})}
//                       className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
//                   </div>
//                 </div>
//                 <button type="submit" disabled={isSubmitting} className="flex items-center gap-3 px-10 py-4 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-700 transition-all disabled:opacity-50">
//                   <Save size={20} /> {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
//                 </button>
//               </form>
//             )}

//             {/* 2. ADRESSES : CONNECTÉES À LA DB */}
//             {activeTab === 'Adresses' && (
//               <div className="space-y-8 animate-fadeIn">
//                 <h3 className="text-2xl font-black text-gray-900">Adresse de livraison</h3>
//                 <div className="p-8 rounded-[32px] border-2 border-orange-500 bg-orange-50 flex flex-col gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="p-4 bg-orange-600 text-white rounded-2xl shadow-lg"><MapPin size={24} /></div>
//                     <div className="flex-1">
//                       <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Adresse enregistrée</p>
//                       <textarea 
//                         value={userData.adresse} 
//                         onChange={(e) => setUserData({...userData, adresse: e.target.value})}
//                         className="w-full bg-transparent border-none font-bold text-gray-900 focus:ring-0 p-0 resize-none"
//                         placeholder="Vous n'avez pas encore défini d'adresse..."
//                         rows="2"
//                       />
//                     </div>
//                   </div>
//                   <button onClick={handleUpdateProfile} className="self-end px-6 py-2 bg-white text-orange-600 rounded-xl font-bold border border-orange-200 hover:bg-orange-100 transition-colors">
//                     Mettre à jour l'adresse
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-400 font-medium italic">Cette adresse sera utilisée par défaut pour vos prochaines commandes.</p>
//               </div>
//             )}

//             {/* 3. PAIEMENT : ENFIN FONCTIONNEL */}
//             {activeTab === 'Paiement' && (
//               <div className="space-y-6 animate-fadeIn">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-2xl font-black text-gray-900">Moyens de paiement</h3>
//                   <button onClick={() => setShowAddCard(true)} className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-xl">
//                     <Plus size={20} /> Ajouter
//                   </button>
//                 </div>
                
//                 <div className="relative w-full max-w-sm h-52 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[24px] p-8 text-white shadow-2xl overflow-hidden group">
//                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
//                         <CreditCard size={120} />
//                     </div>
//                     <div className="h-full flex flex-col justify-between relative z-10">
//                         <div className="flex justify-between items-start">
//                             <div className="w-12 h-8 bg-orange-400/20 rounded-md"></div>
//                             <span className="font-bold italic text-xl">VISA</span>
//                         </div>
//                         <div>
//                             <p className="tracking-[4px] text-lg font-medium">•••• •••• •••• 4242</p>
//                             <div className="flex justify-between mt-4">
//                                 <span className="text-xs text-gray-400 uppercase tracking-widest">{userData.nom}</span>
//                                 <span className="text-xs text-gray-400">12/28</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//               </div>
//             )}

//             {/* 4. HISTORIQUE RAPIDE */}
//             {activeTab === 'Historique' && (
//               <div className="space-y-6 animate-fadeIn">
//                 <h3 className="text-2xl font-black text-gray-900">Dernières commandes</h3>
//                 <div className="space-y-4">
//                   {commandes.slice(0, 3).map(order => (
//                     <div key={order.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px] border border-gray-100 group">
//                       <div>
//                         <p className="font-black text-gray-900 leading-tight">Commande #{order.id}</p>
//                         <p className="text-xs text-gray-400 font-bold uppercase mt-1">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
//                       </div>
//                       <div className="flex items-center gap-6">
//                         <span className="font-black text-lg text-gray-900">{parseFloat(order.total).toFixed(3)} DT</span>
//                         <Link to="/OrderHistory" className="p-3 bg-white text-gray-400 rounded-xl group-hover:text-orange-600 shadow-sm">
//                             <ChevronRight size={20} />
//                         </Link>
//                       </div>
//                     </div>
//                   ))}
//                   <Link to="/OrderHistory" className="block text-center py-4 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest">
//                     Voir tout l'historique
//                   </Link>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* --- MODAL AJOUT CARTE (FONCTIONNEL) --- */}
//       {showAddCard && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-scaleIn">
//                 <div className="flex justify-between items-center mb-8">
//                     <h4 className="text-2xl font-black">Ajouter une carte</h4>
//                     <button onClick={() => setShowAddCard(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
//                 </div>
//                 <div className="space-y-6">
//                     <div className="space-y-1">
//                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro de carte</label>
//                         <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-6 py-4 bg-gray-100 rounded-2xl outline-none font-bold" />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-1">
//                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration</label>
//                             <input type="text" placeholder="MM/AA" className="w-full px-6 py-4 bg-gray-100 rounded-2xl outline-none font-bold" />
//                         </div>
//                         <div className="space-y-1">
//                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CVV</label>
//                             <input type="text" placeholder="***" className="w-full px-6 py-4 bg-gray-100 rounded-2xl outline-none font-bold" />
//                         </div>
//                     </div>
//                     <button onClick={() => { setShowAddCard(false); toast.success("Carte ajoutée (simulation)"); }} 
//                       className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all">
//                       Confirmer
//                     </button>
//                 </div>
//             </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, MapPin, CreditCard, Package, 
  Lock, Save, Plus, Trash2, Camera, Wallet, ShoppingBag, ChevronRight, X, Loader2 
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL; // Toujours nécessaire pour les images si pas d'URL complète

const normalizeAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('data:') || avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  return `${API_BASE_URL}${avatar}`;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Informations');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userData, setUserData] = useState({ id: '', nom: '', email: '', telephone: '', adresse: '' });
  const [initialEmail, setInitialEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null); 
  const [imageFile, setImageFile] = useState(null);   

  const [commandes, setCommandes] = useState([]);
  const [stats, setStats] = useState({ totalDepense: 0, nbCommandes: 0 });
  
  // GESTION DES CARTES (Simulation via LocalStorage)
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardInput, setCardInput] = useState({ number: '', exp: '', cvv: '' });
  const [savedCards, setSavedCards] = useState(() => {
    const saved = localStorage.getItem('simulated_cards');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, orderRes] = await Promise.all([
          api.get('/accounts/utilisateurs/'),
          api.get('/orders/commandes/')
        ]);

        const users = userRes.data.results || userRes.data;
        const user = users[0] || users;
        setUserData({
          id: user.id, nom: user.nom || '', email: user.email || '',
          telephone: user.telephone || '', adresse: user.adresse || ''
        });
        setInitialEmail(user.email);

        const normalizedAvatar = normalizeAvatarUrl(user.avatar);
        const storedAvatar = localStorage.getItem('user_avatar');
        setAvatarUrl(normalizedAvatar || storedAvatar || null);
        if (normalizedAvatar) {
          localStorage.setItem('user_avatar', normalizedAvatar);
          window.dispatchEvent(new Event('avatarChange'));
        }

        const orders = orderRes.data.results || orderRes.data;
        setCommandes(orders);
        const total = orders.reduce((sum, ord) => sum + parseFloat(ord.total), 0);
        setStats({ totalDepense: total, nbCommandes: orders.length });

      } catch (error) {
        toast.error("Erreur de synchronisation");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result); 
        // On avertit la Navbar de se mettre à jour instantanément !
        localStorage.setItem('user_avatar', reader.result);
        window.dispatchEvent(new Event('avatarChange'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    try {
      const formPayload = new FormData();
      formPayload.append('nom', userData.nom);
      formPayload.append('email', userData.email);
      formPayload.append('telephone', userData.telephone);
      formPayload.append('adresse', userData.adresse);
      if (imageFile) formPayload.append('avatar', imageFile); 

      const response = await api.patch(`/accounts/utilisateurs/${userData.id}/`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const savedAvatar = normalizeAvatarUrl(response.data?.avatar) || avatarUrl;
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
        localStorage.setItem('user_avatar', savedAvatar);
        window.dispatchEvent(new Event('avatarChange'));
      }

      if (userData.email !== initialEmail) {
        toast.success("Email modifié. Reconnexion requise...");
        localStorage.clear();
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      } else {
        toast.success("Profil mis à jour !");
        setImageFile(null); 
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FONCTION POUR ENREGISTRER UNE NOUVELLE CARTE EN SIMULATION
  const handleAddNewCard = () => {
    if (cardInput.number.length < 12) {
        toast.error("Numéro de carte invalide"); return;
    }
    const newCard = {
        id: Date.now(),
        last4: cardInput.number.slice(-4), // On prend les 4 derniers
        exp: cardInput.exp || '12/28',
        brand: cardInput.number.startsWith('4') ? 'VISA' : 'MASTERCARD' // Logique simple (4 = Visa)
    };
    
    const updatedCards = [...savedCards, newCard];
    setSavedCards(updatedCards);
    localStorage.setItem('simulated_cards', JSON.stringify(updatedCards)); // Sauvegarde pour le Checkout !
    
    setShowAddCard(false);
    setCardInput({ number: '', exp: '', cvv: '' });
    toast.success("Carte ajoutée avec succès !");
  };

  const handleDeleteCard = (id) => {
      const updated = savedCards.filter(c => c.id !== id);
      setSavedCards(updated);
      localStorage.setItem('simulated_cards', JSON.stringify(updated));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-orange-600"><Loader2 className="animate-spin mr-2" /> Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-4xl font-black border-4 border-white shadow-xl overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" /> : userData.nom?.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => fileInputRef.current.click()} className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all opacity-90 group-hover:opacity-100 group-hover:scale-110">
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <h2 className="text-xl font-black text-gray-900">{userData.nom}</h2>
            <p className="text-gray-400 text-sm font-medium">{userData.email}</p>
          </div>

          <div className="bg-orange-600 p-8 rounded-[32px] shadow-lg flex items-center gap-6 text-white">
            <div className="p-4 bg-white/20 rounded-2xl"><Wallet size={32} /></div>
            <div>
              <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">Dépenses</p>
              <h3 className="text-3xl font-black">{stats.totalDepense.toFixed(3)} DT</h3>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[32px] shadow-lg flex items-center gap-6 text-white">
            <div className="p-4 bg-white/10 rounded-2xl"><ShoppingBag size={32} /></div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Commandes</p>
              <h3 className="text-3xl font-black">{stats.nbCommandes}</h3>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
           <div className="lg:w-72 flex flex-row lg:flex-col gap-2 overflow-x-auto">
            {[
              { id: 'Informations', icon: <User size={20} /> },
              { id: 'Historique', icon: <Package size={20} /> },
              { id: 'Adresses', icon: <MapPin size={20} /> },
              { id: 'Paiement', icon: <CreditCard size={20} /> }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm border border-gray-100 scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 min-h-[500px]">
            {/* INFORMATIONS */}
            {activeTab === 'Informations' && (
              <form onSubmit={handleUpdateProfile} className="space-y-8 animate-fadeIn">
                <h3 className="text-2xl font-black text-gray-900">Paramètres du compte</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom complet</label>
                    <input type="text" value={userData.nom} onChange={(e) => setUserData({...userData, nom: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input type="email" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Téléphone</label>
                    <input type="tel" value={userData.telephone} onChange={(e) => setUserData({...userData, telephone: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-3 px-10 py-4 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-700 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                  {isSubmitting ? "Enregistrement..." : "Sauvegarder les modifications"}
                </button>
              </form>
            )}
            
            {/* ADRESSES */}
            {activeTab === 'Adresses' && (
              <div className="space-y-8 animate-fadeIn">
                <h3 className="text-2xl font-black text-gray-900">Adresse de livraison</h3>
                <div className="p-8 rounded-[32px] border-2 border-orange-500 bg-orange-50 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-600 text-white rounded-2xl shadow-lg"><MapPin size={24} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Adresse enregistrée</p>
                      <textarea value={userData.adresse} onChange={(e) => setUserData({...userData, adresse: e.target.value})}
                        className="w-full bg-transparent border-none font-bold text-gray-900 focus:ring-0 p-0 resize-none"
                        placeholder="Vous n'avez pas encore défini d'adresse..." rows="2" />
                    </div>
                  </div>
                  <button onClick={handleUpdateProfile} className="self-end px-6 py-2 bg-white text-orange-600 rounded-xl font-bold border border-orange-200 hover:bg-orange-100 transition-colors">
                    Mettre à jour l'adresse
                  </button>
                </div>
              </div>
            )}

            {/* PAIEMENT (CARTES DYNAMIQUES) */}
            {activeTab === 'Paiement' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-gray-900">Moyens de paiement</h3>
                  <button onClick={() => setShowAddCard(true)} className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors">
                    <Plus size={20} /> Ajouter
                  </button>
                </div>
                
                {savedCards.length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-gray-200 rounded-[32px] text-center text-gray-400">
                        <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">Aucune carte enregistrée</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedCards.map(card => (
                            <div key={card.id} className="relative w-full h-52 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[24px] p-8 text-white shadow-xl overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <CreditCard size={120} />
                                </div>
                                <button onClick={() => handleDeleteCard(card.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors bg-white/10 p-2 rounded-full z-20">
                                    <Trash2 size={16} />
                                </button>
                                <div className="h-full flex flex-col justify-between relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-8 bg-orange-400/20 rounded-md"></div>
                                        <span className="font-bold italic text-xl">{card.brand}</span>
                                    </div>
                                    <div>
                                        <p className="tracking-[4px] text-lg font-medium">•••• •••• •••• {card.last4}</p>
                                        <div className="flex justify-between mt-4">
                                            <span className="text-xs text-gray-400 uppercase tracking-widest">{userData.nom || "CLIENT"}</span>
                                            <span className="text-xs text-gray-400">{card.exp}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            )}

            {/* HISTORIQUE */}
            {activeTab === 'Historique' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-2xl font-black text-gray-900">Dernières commandes</h3>
                <div className="space-y-4">
                  {commandes.slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px] border border-gray-100 group">
                      <div>
                        <p className="font-black text-gray-900 leading-tight">Commande #{order.id}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase mt-1">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-black text-lg text-gray-900">{parseFloat(order.total).toFixed(3)} DT</span>
                        <Link to="/OrderHistory" className="p-3 bg-white text-gray-400 rounded-xl group-hover:text-orange-600 shadow-sm">
                            <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  ))}
                  <Link to="/OrderHistory" className="block text-center py-4 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest">
                    Voir tout l'historique
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL AJOUT CARTE --- */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-scaleIn">
                <div className="flex justify-between items-center mb-8">
                    <h4 className="text-2xl font-black">Ajouter une carte</h4>
                    <button onClick={() => setShowAddCard(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro de carte</label>
                        <input type="text" placeholder="0000 0000 0000 0000" maxLength="16"
                          value={cardInput.number} onChange={(e) => setCardInput({...cardInput, number: e.target.value})}
                          className="w-full px-6 py-4 bg-gray-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiration</label>
                            <input type="text" placeholder="MM/AA" maxLength="5"
                              value={cardInput.exp} onChange={(e) => setCardInput({...cardInput, exp: e.target.value})}
                              className="w-full px-6 py-4 bg-gray-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CVV</label>
                            <input type="password" placeholder="***" maxLength="3"
                              value={cardInput.cvv} onChange={(e) => setCardInput({...cardInput, cvv: e.target.value})}
                              className="w-full px-6 py-4 bg-gray-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    <button onClick={handleAddNewCard} disabled={!cardInput.number || !cardInput.exp}
                      className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all disabled:opacity-50">
                      Enregistrer la carte
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}