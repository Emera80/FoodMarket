// import React, { useState, useEffect } from 'react';
// import { User, Lock, Truck, Bell, Save, Shield } from 'lucide-react';
// import toast from 'react-hot-toast';
//
// export default function AdminSettings() {
//   const [loading, setLoading] = useState(false);
//
//   // États des paramètres
//   const [settings, setSettings] = useState({
//     siteName: 'Food Marketplace',
//     deliveryFee: 7.000,
//     adminEmail: 'admin@marketplace.com',
//     notifications: true
//   });
//
//   // Au chargement, on essaie de récupérer les frais de livraison s'ils ont été modifiés avant
//   useEffect(() => {
//     const savedFee = localStorage.getItem('deliveryFee');
//     if (savedFee) {
//       setSettings(prev => ({ ...prev, deliveryFee: parseFloat(savedFee) }));
//     }
//   }, []);
//
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setSettings({
//       ...settings,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };
//
//   const handleSave = (e) => {
//     e.preventDefault();
//     setLoading(true);
//
//     // Simulation d'une sauvegarde (API)
//     setTimeout(() => {
//       // On sauvegarde les frais de livraison dans le localStorage pour pouvoir les utiliser dans AdminOrders.jsx !
//       localStorage.setItem('deliveryFee', settings.deliveryFee);
//
//       toast.success("Paramètres mis à jour avec succès !");
//       setLoading(false);
//     }, 800);
//   };
//
//   return (
//     <div className="space-y-6 animate-fadeIn pb-10">
//       <div>
//         <h1 className="text-2xl font-black text-gray-900">Paramètres système</h1>
//         <p className="text-gray-500 font-medium">Configurez les options globales de votre plateforme.</p>
//       </div>
//
//       <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//
//         {/* Colonne Gauche : Navigation interne des paramètres (Esthétique) */}
//         <div className="lg:col-span-1 space-y-2">
//           <div className="bg-white rounded-[24px] border border-gray-100 p-4 shadow-sm space-y-1">
//             <button type="button" className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-bold text-sm transition-colors">
//               <Truck size={18} /> Configuration Plateforme
//             </button>
//             <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors">
//               <User size={18} /> Profil Administrateur
//             </button>
//             <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors">
//               <Shield size={18} /> Sécurité & Mots de passe
//             </button>
//             <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors">
//               <Bell size={18} /> Notifications
//             </button>
//           </div>
//         </div>
//
//         {/* Colonne Droite : Les formulaires */}
//         <div className="lg:col-span-2 space-y-6">
//
//           {/* Bloc 1 : Paramètres Plateforme */}
//           <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
//             <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
//               <Truck className="text-orange-600" /> Configuration Générale
//             </h2>
//
//             <div className="space-y-5">
//               <div>
//                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom de l'application</label>
//                 <input
//                   type="text" name="siteName" value={settings.siteName} onChange={handleChange}
//                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900"
//                 />
//               </div>
//
//               <div>
//                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Frais de livraison par défaut (DT)</label>
//                 <div className="relative">
//                   <input
//                     type="number" step="0.001" name="deliveryFee" value={settings.deliveryFee} onChange={handleChange}
//                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-gray-900"
//                   />
//                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">DT</span>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-2 font-medium">Ce montant sera appliqué automatiquement à toutes les nouvelles commandes.</p>
//               </div>
//             </div>
//           </div>
//
//           {/* Bloc 2 : Paramètres Compte */}
//           <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
//             <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
//               <User className="text-blue-600" /> Profil Administrateur
//             </h2>
//
//             <div className="space-y-5">
//               <div>
//                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email de contact</label>
//                 <input
//                   type="email" name="adminEmail" value={settings.adminEmail} onChange={handleChange}
//                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
//                 />
//               </div>
//
//               <div className="pt-2">
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange}
//                     className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
//                   />
//                   <span className="ml-3 text-sm font-bold text-gray-800">
//                     Recevoir des alertes par email pour les nouvelles commandes
//                   </span>
//                 </label>
//               </div>
//             </div>
//           </div>
//
//           {/* Bouton de sauvegarde */}
//           <div className="flex justify-end pt-4">
//             <button
//               type="submit" disabled={loading}
//               className={`flex items-center gap-2 px-8 py-4 font-black text-white rounded-2xl shadow-lg transition-all ${loading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-200'}`}
//             >
//               <Save size={20} />
//               {loading ? "Sauvegarde..." : "Enregistrer les modifications"}
//             </button>
//           </div>
//
//         </div>
//       </form>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { User, Shield, Truck, Bell, Save, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('plateforme');
  const [loading, setLoading] = useState(false);

  // États des différents formulaires
  const [platformSettings, setPlatformSettings] = useState({ siteName: 'Food Marketplace', deliveryFee: 7.000 });
  const [profileSettings, setProfileSettings] = useState({ nom: '', email: '' });
  const [securitySettings, setSecuritySettings] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [notifSettings, setNotifSettings] = useState({ emailAlerts: true });

  // Au chargement, on récupère les infos locales
  useEffect(() => {
    const savedFee = localStorage.getItem('deliveryFee');
    if (savedFee) setPlatformSettings(prev => ({ ...prev, deliveryFee: parseFloat(savedFee) }));

    setProfileSettings({
      nom: localStorage.getItem('username') || '',
      email: '' // On laisse vide si on n'a pas stocké l'email dans le localStorage
    });
  }, []);

  // --- GESTIONNAIRES DE SOUMISSION ---

  const handlePlatformSave = (e) => {
    e.preventDefault();
    localStorage.setItem('deliveryFee', platformSettings.deliveryFee);
    toast.success("Frais de livraison mis à jour !");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.put('http://127.0.0.1:8000/api/accounts/profile/update/', profileSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('username', res.data.nom);
      window.dispatchEvent(new Event('authChange')); // Met à jour la Navbar
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally { setLoading(false); }
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (securitySettings.new_password !== securitySettings.confirm_password) {
      return toast.error("Les nouveaux mots de passe ne correspondent pas.");
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/accounts/profile/change-password/', securitySettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Mot de passe modifié avec succès !");
      setSecuritySettings({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors du changement de mot de passe.");
    } finally { setLoading(false); }
  };

  // --- SYSTÈME D'ONGLETS ---
  const tabs = [
    { id: 'plateforme', label: 'Configuration Plateforme', icon: <Truck size={18} /> },
    { id: 'profil', label: 'Profil Administrateur', icon: <User size={18} /> },
    { id: 'securite', label: 'Sécurité & Mots de passe', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Paramètres système</h1>
        <p className="text-gray-500 font-medium">Configurez les options globales de votre plateforme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* MENU LATÉRAL DES PARAMÈTRES */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[24px] border border-gray-100 p-3 shadow-sm flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENU DES ONGLETS */}
        <div className="lg:col-span-3">

          {/* 1. PLATEFORME */}
          {activeTab === 'plateforme' && (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 animate-fadeIn">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Truck className="text-orange-600" /> Configuration Générale</h2>
              <form onSubmit={handlePlatformSave} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Frais de livraison par défaut (DT)</label>
                  <div className="relative max-w-md">
                    <input
                      type="number" step="0.001"
                      value={platformSettings.deliveryFee}
                      onChange={(e) => setPlatformSettings({...platformSettings, deliveryFee: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-gray-900"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">DT</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl shadow-lg transition-all">
                    <Save size={18} /> Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. PROFIL */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 animate-fadeIn">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><User className="text-blue-600" /> Profil Administrateur</h2>
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="max-w-md">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom affiché</label>
                  <input
                    type="text" value={profileSettings.nom}
                    onChange={(e) => setProfileSettings({...profileSettings, nom: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
                  />
                </div>
                <div className="max-w-md">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nouvelle adresse email</label>
                  <input
                    type="email" value={profileSettings.email}
                    onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                    placeholder="Laisser vide pour ne pas modifier"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900"
                  />
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white font-black text-sm rounded-xl shadow-lg transition-all">
                    {loading ? "Mise à jour..." : <><Save size={18} /> Mettre à jour le profil</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. SÉCURITÉ */}
          {activeTab === 'securite' && (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 animate-fadeIn">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Shield className="text-red-600" /> Modifier le mot de passe</h2>
              <form onSubmit={handleSecuritySave} className="space-y-5">
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mot de passe actuel</label>
                    <input
                      type="password" required value={securitySettings.old_password}
                      onChange={(e) => setSecuritySettings({...securitySettings, old_password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                    <input
                      type="password" required minLength="8" value={securitySettings.new_password}
                      onChange={(e) => setSecuritySettings({...securitySettings, new_password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Confirmer le mot de passe</label>
                    <input
                      type="password" required minLength="8" value={securitySettings.confirm_password}
                      onChange={(e) => setSecuritySettings({...securitySettings, confirm_password: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-900"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-lg transition-all">
                    {loading ? "Modification..." : <><Lock size={18} /> Changer le mot de passe</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 animate-fadeIn">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Bell className="text-yellow-500" /> Préférences d'alertes</h2>
              <div className="pt-2">
                <label className="flex items-center cursor-pointer p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox" checked={notifSettings.emailAlerts}
                    onChange={(e) => setNotifSettings({emailAlerts: e.target.checked})}
                    className="w-5 h-5 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div className="ml-4">
                    <span className="block text-sm font-black text-gray-900">Alertes In-App & Push</span>
                    <span className="block text-xs font-medium text-gray-500 mt-0.5">Recevoir des notifications pour les nouvelles commandes et messages.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}