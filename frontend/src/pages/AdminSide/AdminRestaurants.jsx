import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Plus, Search, Edit2, Trash2, 
  Power, PowerOff, Store, AlertTriangle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminRestaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/catalog/restaurants/');
      setRestaurants(response.data.results || response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des restaurants");
    } finally { setLoading(false); }
  };

  const confirmDelete = (restaurant) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gray-900">
          <AlertTriangle className="text-red-500" size={20} />
          <span className="font-bold text-sm">Supprimer "{restaurant.nom}" ?</span>
        </div>
        <p className="text-xs text-gray-500">Attention, tous les plats associés seront aussi supprimés !</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">
            Annuler
          </button>
          <button onClick={() => { toast.dismiss(t.id); executeDelete(restaurant.id); }} className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600">
            Confirmer
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const executeDelete = async (id) => {
    try {
      await api.delete(`/catalog/restaurants/${id}/`);
      toast.success("Restaurant supprimé");
      setRestaurants(restaurants.filter(r => r.id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleStatus = async (restaurant) => {
    try {
      await api.patch(`/catalog/restaurants/${restaurant.id}/`, 
        { is_active: !restaurant.is_active }
      );
      toast.success(`Le restaurant est maintenant ${restaurant.is_active ? 'Inactif' : 'Actif'}`);
      fetchRestaurants();
    } catch (error) { toast.error("Erreur de modification"); }
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type_cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion des Restaurants</h1>
          <p className="text-gray-500 font-medium">Gérez vos établissements partenaires et leur visibilité.</p>
        </div>
        <Link to="/admin/restaurant/add" className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200">
          <Plus size={20} /> Ajouter un restaurant
        </Link>
      </div>

      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input type="text" placeholder="Rechercher par nom ou spécialité..." className="flex-1 bg-transparent border-none outline-none font-bold text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Établissement</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Spécialité</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Contact & Horaires</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRestaurants.map((rest) => (
                <tr key={rest.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                      {rest.image ? (
                        <img src={rest.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Store size={20}/></div>
                      )}
                     </div>
                     <div>
                        <span className="font-bold text-gray-900 block">{rest.nom}</span>
                        {/* Remplacement dans AdminRestaurants.jsx (ligne ~121) */}
                        <span className="text-xs text-gray-500 block whitespace-normal max-w-[200px] leading-tight mt-1">{rest.adresse}</span>
                     </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {rest.type_cuisine}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                     <span className="font-medium text-sm text-gray-900 block">{rest.telephone || "Non renseigné"}</span>
                     <span className="text-xs text-gray-500 block">{rest.horaires || "Horaires non définis"}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rest.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${rest.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {rest.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleStatus(rest)} className={`p-2 rounded-xl transition-colors ${rest.is_active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={rest.is_active ? "Désactiver" : "Activer"}>
                        {rest.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                      
                      <Link to={`/admin/restaurant/edit/${rest.id}`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Modifier">
                        <Edit2 size={18} />
                      </Link>

                      <button onClick={() => confirmDelete(rest)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}