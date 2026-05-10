import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, SlidersHorizontal, UtensilsCrossed, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function PlatsPage() {
  const [plats, setPlats] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPlats, resRest] = await Promise.all([
          api.get('/catalog/plats/'),
          api.get('/catalog/restaurants/')
        ]);
        
        // Gestion de la pagination Django si elle est activée
        setPlats(resPlats.data.results || resPlats.data);
        setRestaurants(resRest.data.results || resRest.data);
      } catch (err) {
        console.error("Erreur de chargement des plats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // // Extraire les catégories uniques (ex: Entrée, Plat, Dessert, Boisson)
  // const categories = ['Toutes', ...new Set(plats.map(p => p.categorie).filter(Boolean))];

  // Fonction pour trouver le nom du restaurant
  const getRestaurantName = (id) => {
    const rest = restaurants.find(r => r.id === id);
    return rest ? rest.nom : '';
  };

  // // LOGIQUE DE FILTRAGE
  // const filteredPlats = plats.filter(plat => {
  //   const matchesCategory = selectedCategory === 'Toutes' || plat.categorie === selectedCategory;
  //   const matchesSearch = 
  //     plat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (plat.description && plat.description.toLowerCase().includes(searchTerm.toLowerCase()));

  //   return matchesCategory && matchesSearch;
  // });

  // 1. Fonction pour trouver la spécialité (type_cuisine) du restaurant
  const getRestaurantCuisine = (id) => {
    const rest = restaurants.find(r => r.id === id);
    return rest ? rest.type_cuisine : 'Autre';
  };

  // 2. Extraire les types de cuisines uniques dynamiquement
  const categories = ['Toutes', ...new Set(plats.map(p => getRestaurantCuisine(p.restaurant)).filter(Boolean))];

  // 3. LOGIQUE DE FILTRAGE MISE À JOUR
  const filteredPlats = plats.filter(plat => {
    const platCuisine = getRestaurantCuisine(plat.restaurant);
    
    // On vérifie si la cuisine correspond au filtre cliqué
    const matchesCategory = selectedCategory === 'Toutes' || platCuisine === selectedCategory;
    
    const matchesSearch = 
      plat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plat.description && plat.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (plat) => {
    addToCart(plat);
    toast.success(`${plat.nom} ajouté au panier !`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-orange-600">Préparation du menu...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER & RECHERCHE */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Tous nos plats</h1>
          <p className="text-gray-500 mb-8 font-medium">Une envie précise ? Trouvez votre bonheur parmi toutes nos spécialités.</p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input 
                type="text" 
                placeholder="Cherchez un plat (ex: Pizza, Tacos, Salade...)" 
                className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none text-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
              <SlidersHorizontal size={20} />
              Filtres
            </button>
          </div>

          {/* CATÉGORIES */}
          <div className="flex gap-3 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button 
                key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRILLE DES PLATS */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlats.map(plat => (
            <div key={plat.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              
              {/* Image du plat */}
              <div className="h-48 relative overflow-hidden bg-gray-100 group">
                {plat.image ? (
                  <img src={plat.image} alt={plat.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <UtensilsCrossed size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                  <span className="text-sm font-black text-gray-900">{parseFloat(plat.prix).toFixed(3)} DT</span>
                </div>
              </div>

              {/* Infos */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-black text-gray-900 line-clamp-1">{plat.nom}</h3>
                </div>
                
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
                  {getRestaurantName(plat.restaurant)}
                </p>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1 font-medium">
                  {plat.description || "Un délice préparé avec soin."}
                </p>

                {/* Bouton Ajouter */}
                <button 
                  onClick={() => handleAddToCart(plat)}
                  className="w-full py-3 bg-gray-50 hover:bg-orange-600 text-gray-800 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-100 hover:border-orange-600 group"
                >
                  <Plus size={18} className="text-gray-400 group-hover:text-white transition-colors" /> 
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPlats.length === 0 && (
          <div className="text-center py-20">
            <UtensilsCrossed className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-2xl font-bold text-gray-400">Aucun plat trouvé pour cette recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}