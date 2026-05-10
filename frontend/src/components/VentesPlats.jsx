import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Star, ShoppingCart, Heart, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function VentesPlats() {
  const [plats, setPlats] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchTopVentes = async () => {
      try {
        const [resPlats, resRest] = await Promise.all([
          // Appel à ta nouvelle route intelligente côté Django !
          api.get('/catalog/plats/top_ventes/'),
          api.get('/catalog/restaurants/')
        ]);
        
        // Django nous renvoie déjà uniquement les 4 plats les plus vendus
        setPlats(resPlats.data.results || resPlats.data);
        setRestaurants(resRest.data.results || resRest.data);
        
      } catch (err) {
        console.error("Erreur de chargement des meilleures ventes", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopVentes();
  }, []);

  // Fonction pour récupérer les infos du restaurant (Nom + Note moyenne)
  const getRestaurantInfo = (id) => {
    const rest = restaurants.find(r => r.id === id);
    return rest 
      ? { nom: rest.nom, note: parseFloat(rest.note_moyenne).toFixed(1) } 
      : { nom: 'Restaurant', note: '5.0' };
  };

  const handleAddToCart = (plat) => {
    addToCart(plat);
    toast.success(`${plat.nom} ajouté au panier !`);
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center font-bold text-orange-500">Chargement des meilleures ventes...</div>;
  }

  if (plats.length === 0) {
     return <div className="text-center text-gray-500 font-bold py-10">Les meilleures ventes apparaîtront ici après vos premières commandes !</div>;
  }

  return (
    <>
      {/* Grille des plats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {plats.map((plat) => {
          const restInfo = getRestaurantInfo(plat.restaurant);

          return (
            /* La Carte du plat (Conteneur principal) */
            <div 
              key={plat.id} 
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden relative flex flex-col"
            >
              
              {/* Bouton Favoris (Flottant en haut à droite) */}
              <button className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors">
                <Heart size={20} />
              </button>

              {/* Conteneur de l'image avec zoom au survol */}
              <div className="relative h-56 overflow-hidden bg-gray-50">
                {plat.image ? (
                  <img 
                    src={plat.image} 
                    alt={plat.nom} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <UtensilsCrossed size={48} />
                  </div>
                )}
              </div>

              {/* Contenu textuel de la carte */}
              <div className="p-6 flex flex-col flex-grow">
                
                {/* Avis & Restaurant */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500 font-medium truncate pr-2">{restInfo.nom}</span>
                  <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg shrink-0">
                    <Star size={14} className="text-[#FF6B00]" fill="#FF6B00" />
                    <span className="text-sm font-bold text-zinc-800">{restInfo.note}</span>
                  </div>
                </div>

                {/* Titre du plat */}
                <h3 className="text-xl font-bold text-zinc-900 mb-6 line-clamp-1">
                  {plat.nom}
                </h3>

                {/* Ligne du bas : Prix + Bouton d'ajout */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-start">
                    <span className="text-2xl font-black text-black">{parseFloat(plat.prix).toFixed(3)}</span>
                    <span className="text-sm text-gray-500 ml-1 mt-1">DT</span>
                  </div>
                  
                  {/* Bouton d'ajout au panier qui s'élargit au survol */}
                  <button 
                    onClick={() => handleAddToCart(plat)}
                    className="bg-black hover:bg-[#FF6B00] text-white p-3 rounded-2xl transition-colors duration-300 shadow-md flex items-center justify-center gap-2 group-hover:px-4"
                  >
                    <ShoppingCart size={20} />
                    <span className="hidden group-hover:inline text-sm font-bold animate-fadeIn">Ajouter</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}

      </div>
    </>
  );
}