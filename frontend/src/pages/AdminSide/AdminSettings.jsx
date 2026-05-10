import React, { useState, useEffect } from 'react';
import { User, Lock, Truck, Bell, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  
  // États des paramètres
  const [settings, setSettings] = useState({
    siteName: 'Food Marketplace',
    deliveryFee: 7.000,
    adminEmail: 'admin@marketplace.com',
    notifications: true
  });

  // Au chargement, on essaie de récupérer les frais de livraison s'ils ont été modifiés avant
  useEffect(() => {
    const savedFee = localStorage.getItem('deliveryFee');
    if (savedFee) {
      setSettings(prev => ({ ...prev, deliveryFee: parseFloat(savedFee) }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation d'une sauvegarde (API)
    setTimeout(() => {
      // On sauvegarde les frais de livraison dans le localStorage pour pouvoir les utiliser dans AdminOrders.jsx !
      localStorage.setItem('deliveryFee', settings.deliveryFee);
      
      toast.success("Paramètres mis à jour avec succès !");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Paramètres système</h1>
        <p className="text-gray-500 font-medium">Configurez les options globales de votre plateforme.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Gauche : Navigation interne des paramètres (Esthétique) */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-[24px] border border-gray-100 p-4 shadow-sm space-y-1">
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-bold text-sm transition-colors">
              <Truck size={18} /> Configuration Plateforme
            </button>
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors">
              <User size={18} /> Profil Administrateur
            </button>
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors">
              <Shield size={18} /> Sécurité & Mots de passe
            </button>
            <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors">
              <Bell size={18} /> Notifications
            </button>
          </div>
        </div>

        {/* Colonne Droite : Les formulaires */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bloc 1 : Paramètres Plateforme */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="text-orange-600" /> Configuration Générale
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom de l'application</label>
                <input 
                  type="text" name="siteName" value={settings.siteName} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Frais de livraison par défaut (DT)</label>
                <div className="relative">
                  <input 
                    type="number" step="0.001" name="deliveryFee" value={settings.deliveryFee} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-gray-900" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">DT</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">Ce montant sera appliqué automatiquement à toutes les nouvelles commandes.</p>
              </div>
            </div>
          </div>

          {/* Bloc 2 : Paramètres Compte */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <User className="text-blue-600" /> Profil Administrateur
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email de contact</label>
                <input 
                  type="email" name="adminEmail" value={settings.adminEmail} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900" 
                />
              </div>
              
              <div className="pt-2">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange}
                    className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <span className="ml-3 text-sm font-bold text-gray-800">
                    Recevoir des alertes par email pour les nouvelles commandes
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" disabled={loading}
              className={`flex items-center gap-2 px-8 py-4 font-black text-white rounded-2xl shadow-lg transition-all ${loading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-200'}`}
            >
              <Save size={20} />
              {loading ? "Sauvegarde..." : "Enregistrer les modifications"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}