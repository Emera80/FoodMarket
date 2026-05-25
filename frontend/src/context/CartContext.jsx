
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// 1. On crée le contexte (le cerveau)
const CartContext = createContext();

// 2. On crée le fournisseur (celui qui va englober l'application)
export function CartProvider({ children }) {
  // On initialise le panier avec ce qui est dans le localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('foodmarket_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // À chaque fois que le panier change, on le sauvegarde dans le navigateur
  useEffect(() => {
    localStorage.setItem('foodmarket_cart', JSON.stringify(cart));
  }, [cart]);

  // --- LA FONCTION CORRIGÉE ---
  // --- LA FONCTION ADD TO CART AVEC TOAST INTERACTIF ---
  const addToCart = (plat) => {
    if (cart.length > 0) {
      const currentRestaurantId = String(cart[0].restaurant?.id || cart[0].restaurant);
      const newPlatRestaurantId = String(plat.restaurant?.id || plat.restaurant);

      if (newPlatRestaurantId !== currentRestaurantId) {
        // 💥 ON LANCE LE TOAST INTERACTIF ICI 💥
        toast((t) => (
          <div className="flex flex-col gap-3">
            <div className="font-bold text-white text-sm">
              Votre panier contient des plats d'un autre restaurant.
            </div>
            <p className="text-xs text-white font-medium">
              Voulez-vous vider votre panier actuel pour commencer une nouvelle commande ici ?
            </p>
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id); // On ferme ce toast interactif
                  setCart([{ ...plat, quantity: 1 }]); // On écrase le panier
                  setIsCartOpen(true);
                  toast.success("Nouveau panier créé !");
                }}
                className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Oui, vider
              </button>
              
              <button
                onClick={() => {
                  toast.dismiss(t.id); // On ferme juste le toast
                  toast.error("Ajout annulé.");
                }}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
              >
                Non, annuler
              </button>
            </div>
          </div>
        ), { 
          duration: Infinity, // Le toast reste affiché tant qu'on ne clique pas
          id: 'cart-conflict' // Empêche d'ouvrir 50 toasts si on clique frénétiquement
        });

        return; // On arrête la fonction ici, les boutons du toast feront le reste !
      }
    }

    // --- LE RESTE DE LA FONCTION NE CHANGE PAS ---
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === plat.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === plat.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...plat, quantity: 1 }];
      }
    });
    
    setIsCartOpen(true); 
  };

  // Fonction pour retirer un plat
  const removeFromCart = (platId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== platId));
  };

  // Fonction pour modifier la quantité
  const updateQuantity = (platId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart => prevCart.map(item => 
      item.id === platId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Fonction pour vider le panier
  const clearCart = () => setCart([]);

  // Calcul du prix total et du nombre d'articles
  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.prix) * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotal, cartCount, 
      isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Hook personnalisé
export const useCart = () => useContext(CartContext);