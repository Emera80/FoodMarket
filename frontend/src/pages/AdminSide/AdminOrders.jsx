import React, { useState, useEffect } from 'react';
import api from '../../services/api';
// Ajout de Store (restaurant) et Calendar (date) pour les icônes
import { Search, Eye, Filter, Loader2, X, MapPin, Phone, CreditCard, Package, Store, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUTS_CONFIG = {
  'en_attente': { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  'confirmee': { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'en_preparation': { label: 'En preparation', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'en_livraison': { label: 'En livraison', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  'livree': { label: 'Livrée', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'annulee': { label: 'Annulée', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
};

export default function AdminOrders() {
  const [commandes, setCommandes] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // Nouveau state pour les restaurants
  const [loading, setLoading] = useState(true);
  
  // États pour les 4 filtres demandés
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    try {
      // On charge les commandes ET les restaurants en même temps
      const [ordRes, restRes] = await Promise.all([
        api.get('/orders/commandes/'),
        api.get('/catalog/restaurants/')
      ]);
      setCommandes(ordRes.data.results || ordRes.data);
      setRestaurants(restRes.data.results || restRes.data);
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally { setLoading(false); }
  };

  const handleStatusChange = async (commandeId, newStatus) => {
    try {
      await api.patch(`/orders/commandes/${commandeId}/`, 
        { statut_livraison: newStatus }
      );
      toast.success(`Statut mis à jour`);
      setCommandes(commandes.map(cmd => cmd.id === commandeId ? { ...cmd, statut_livraison: newStatus } : cmd));
      if(selectedOrder?.id === commandeId) {
        setSelectedOrder(prev => ({...prev, statut_livraison: newStatus}));
      }
    } catch (error) { toast.error("Erreur de mise à jour"); }
  };

  // --- LE MOTEUR DE FILTRAGE MULTIPLE ---
  const filteredCommandes = commandes.filter(cmd => {
    // 1. Recherche par N° ou Nom
    const searchMatch = String(cmd.id).includes(searchTerm) || 
                        (cmd.user_name && cmd.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 2. Filtre par Statut
    const statusMatch = statusFilter ? cmd.statut_livraison === statusFilter : true;
    
    // 3. Filtre par Restaurant
    const restaurantMatch = restaurantFilter ? String(cmd.restaurant) === String(restaurantFilter) : true;
    
    // 4. Filtre par Date
    const cmdDate = new Date(cmd.date).toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
    const dateMatch = dateFilter ? cmdDate === dateFilter : true;

    return searchMatch && statusMatch && restaurantMatch && dateMatch;
  });

  // Dans AdminOrders.jsx, remplace la constante statique :
// const FRAIS_LIVRAISON = 7.000;

// Par cette version dynamique :
    const FRAIS_LIVRAISON = parseFloat(localStorage.getItem('deliveryFee')) || 7.000;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ==================================================== */}
      {/* HEADER & BARRE DE FILTRES COMPLÈTE */}
      {/* ==================================================== */}
      <div className="flex flex-col gap-4">
        
        {/* Ligne 1: Titre et barre de recherche principale */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-gray-900">Gestion des Commandes</h1>
          <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 w-full md:w-96 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="N° commande, Client..." className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Ligne 2: Les 3 filtres demandés par le prof */}
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Filtre Statut */}
          <div className="flex-1 bg-white px-4 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
            <Filter size={18} className="text-orange-500" />
            <select className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-gray-700 cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tous les statuts</option>
              {Object.entries(STATUTS_CONFIG).map(([key, sc]) => <option key={key} value={key}>{sc.label}</option>)}
            </select>
          </div>

          {/* Filtre Restaurant */}
          <div className="flex-1 bg-white px-4 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
            <Store size={18} className="text-orange-500" />
            <select className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-gray-700 cursor-pointer" value={restaurantFilter} onChange={(e) => setRestaurantFilter(e.target.value)}>
              <option value="">Tous les restaurants</option>
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>

          {/* Filtre Date */}
          <div className="flex-1 bg-white px-4 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
            <Calendar size={18} className="text-orange-500" />
            <input type="date" className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-gray-700 cursor-pointer" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors" title="Effacer la date">
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* TABLEAU RÉSUMÉ */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">N° CMD</th>
              <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Client</th>
              <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
              <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
              <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredCommandes.map((cmd) => {
              const config = STATUTS_CONFIG[cmd.statut_livraison] || STATUTS_CONFIG['en_attente'];
              
              return (
                <tr key={cmd.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-black">#{cmd.id}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 block">{cmd.user_name || "Client"}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{cmd.restaurant_nom}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600">{new Date(cmd.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-black">{parseFloat(cmd.total).toFixed(3)} DT</td>
                  
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select 
                        className={`appearance-none pl-6 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer border-2 border-transparent hover:border-gray-200 transition-all outline-none ${config.color}`}
                        value={cmd.statut_livraison}
                        onChange={(e) => handleStatusChange(cmd.id, e.target.value)}
                      >
                        {Object.entries(STATUTS_CONFIG).map(([key, statConfig]) => (
                          <option key={key} value={key}>{statConfig.label}</option>
                        ))}
                      </select>
                      <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${config.dot} pointer-events-none`}></div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => {setSelectedOrder(cmd); setIsModalOpen(true);}} className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredCommandes.length === 0 && (
          <div className="p-12 text-center">
             <p className="text-gray-400 font-bold">Aucune commande ne correspond à vos filtres.</p>
             <button onClick={() => {setStatusFilter(''); setRestaurantFilter(''); setDateFilter(''); setSearchTerm('');}} className="mt-4 text-orange-600 font-bold text-sm hover:underline">Réinitialiser les filtres</button>
          </div>
        )}
      </div>

      {/* --- MODALE DÉTAIL D'UNE COMMANDE --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl animate-slideUp">
            
            {/* Header de la Modale */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 transition-colors">
                <X size={20} /> Retour
              </button>
              <h2 className="text-xl font-black text-gray-900">Commande <span className="text-orange-600">#{selectedOrder.id}</span></h2>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${STATUTS_CONFIG[selectedOrder.statut_livraison]?.color}`}>
                {STATUTS_CONFIG[selectedOrder.statut_livraison]?.label}
              </span>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Colonne Gauche : Informations */}
              <div className="space-y-8">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Informations</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-bold">Client</span>
                    <span className="text-gray-900 font-black">{selectedOrder.user_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-bold">Téléphone</span>
                    <span className="text-gray-900 font-black">{selectedOrder.user_phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-bold">Restaurant</span>
                    <span className="text-orange-600 font-black">{selectedOrder.restaurant_nom || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-bold">Date</span>
                    <span className="text-gray-900 font-bold">{new Date(selectedOrder.date).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-gray-500 font-bold block">Adresse de livraison</span>
                    <p className="bg-gray-50 p-4 rounded-2xl text-gray-900 font-bold text-sm leading-relaxed flex gap-2">
                        <MapPin size={16} className="text-orange-500 shrink-0" /> {selectedOrder.adresse_livraison}
                    </p>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500 font-bold">Mode de paiement</span>
                    <span className="text-gray-900 font-black capitalize">{selectedOrder.mode_paiement.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Boutons de statut dans la modale */}
                <div className="pt-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Changer le statut</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(STATUTS_CONFIG).map(([key, config]) => (
                            <button 
                                key={key}
                                onClick={() => handleStatusChange(selectedOrder.id, key)}
                                className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedOrder.statut_livraison === key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              {/* Colonne Droite : Articles & Total */}
              <div className="space-y-8">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Articles</h3>
                
                <div className="bg-gray-50 rounded-[24px] overflow-hidden border border-gray-100">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Article</th>
                                <th className="px-6 py-4 text-center">Qté</th>
                                <th className="px-6 py-4 text-right">Prix</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedOrder.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 font-bold text-gray-900">{item.plat_nom || `Plat #${item.plat}`}</td>
                                    <td className="px-6 py-4 text-center font-black">x{item.quantite}</td>
                                    <td className="px-6 py-4 text-right font-black">{parseFloat(item.sous_total).toFixed(3)} DT</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Récapitulatif financier */}
                    <div className="p-6 bg-white border-t border-gray-100 space-y-3">
                        <div className="flex justify-between text-gray-500 font-bold">
                            <span>Sous-total</span>
                            <span>{(parseFloat(selectedOrder.total) - FRAIS_LIVRAISON).toFixed(3)} DT</span>
                        </div>
                        <div className="flex justify-between text-gray-500 font-bold">
                            <span>Frais de livraison</span>
                            <span>{FRAIS_LIVRAISON.toFixed(3)} DT</span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-black text-gray-900 uppercase text-xs tracking-widest">Total</span>
                            <span className="text-2xl font-black text-orange-600">{parseFloat(selectedOrder.total).toFixed(3)} DT</span>
                        </div>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}