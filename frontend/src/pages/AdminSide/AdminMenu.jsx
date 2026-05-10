import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Plus, Search, Edit2, Trash2, 
  Power, PowerOff, UtensilsCrossed, AlertTriangle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminMenu() {
  const navigate = useNavigate();
  const [plats, setPlats] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // Ajout de l'état pour les restaurants
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchPlats(); }, []);

  const fetchPlats = async () => {
    const token = localStorage.getItem('access_token');
    try {
      // On récupère les plats ET les restaurants simultanément
      const [platsRes, restsRes] = await Promise.all([
        api.get('/catalog/plats/'),
        api.get('/catalog/restaurants/')
      ]);
      setPlats(platsRes.data.results || platsRes.data);
      setRestaurants(restsRes.data.results || restsRes.data);
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally { setLoading(false); }
  };

  // Fonction pour récupérer le type de cuisine (tunisien, américain...) du restaurant
  const getRestaurantCuisine = (restId) => {
    const restaurant = restaurants.find(r => r.id === restId);
    return restaurant ? restaurant.type_cuisine : 'Non défini';
  };

  // --- SUPPRESSION AVEC TOAST DE CONFIRMATION PERSONNALISÉ ---
  const confirmDelete = (plat) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-gray-900">
          <AlertTriangle className="text-red-500" size={20} />
          <span className="font-bold text-gray-900 text-sm">Supprimer "{plat.nom}" ?</span>
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete(plat.id);
            }}
            className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
          >
            Confirmer
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const executeDelete = async (id) => {
    try {
      await api.delete(`/catalog/plats/${id}/`);
      toast.success("Plat retiré du catalogue");
      setPlats(plats.filter(p => p.id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleAvailability = async (plat) => {
    try {
      await api.patch(`/catalog/plats/${plat.id}/`, 
        { is_available: !plat.is_available }
      );
      // Toast modifié selon ta demande
      toast.success(`${plat.nom} est maintenant ${plat.is_available ? 'indisponible' : 'disponible'}`);
      fetchPlats();
    } catch (error) { toast.error("Erreur de modification"); }
  };

  const filteredPlats = plats.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion du Menu</h1>
          <p className="text-gray-500 font-medium">Gérez la visibilité et les prix de vos plats.</p>
        </div>
        <Link to="/admin/dish/add" className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200">
          <Plus size={20} /> Ajouter un plat
        </Link>
      </div>

      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input type="text" placeholder="Rechercher par nom ou type..." className="flex-1 bg-transparent border-none outline-none font-bold text-gray-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Plat</th>
                {/* NOUVELLES COLONNES */}
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Catégorie</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Type de plat</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Prix</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPlats.map((plat) => (
                <tr key={plat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {plat.image ? (
                        <img src={plat.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><UtensilsCrossed size={16}/></div>
                      )}
                     </div>
                     <span className="font-bold text-gray-900">{plat.nom}</span>
                  </td>
                  
                  {/* AFFICHAGE DE LA CATÉGORIE (Tunisien, Américain...) */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-500">
                      {getRestaurantCuisine(plat.restaurant)}
                    </span>
                  </td>

                  {/* AFFICHAGE DU TYPE DE PLAT (Entrée, Plat principal...) */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {plat.categorie}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-black text-gray-900">{parseFloat(plat.prix).toFixed(3)} DT</td>
                  
                  {/* AFFICHAGE DU STATUT (Disponible / Indisponible) */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${plat.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${plat.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {plat.is_available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleAvailability(plat)} className={`p-2 rounded-xl transition-colors ${plat.is_available ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={plat.is_available ? "Rendre indisponible" : "Rendre disponible"}>
                        {plat.is_available ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                      
                      <Link to={`/admin/dish/edit/${plat.id}`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Modifier">
                        <Edit2 size={18} />
                      </Link>

                      <button onClick={() => confirmDelete(plat)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
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