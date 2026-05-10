// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import { useCart } from "../../context/CartContext";
// import {
// 	CheckCircle2,
// 	CreditCard,
// 	Wallet,
// 	Truck,
// 	ArrowRight,
// 	Check,
// 	Lock,
// } from "lucide-react";

// export default function Checkout() {
// 	const navigate = useNavigate();
// 	const { cart, cartTotal, clearCart } = useCart();
  
//   const [currentStep, setCurrentStep] = useState(1); 
//   const [isOrdered, setIsOrdered] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // --- PRÉ-REMPLISSAGE DES DONNÉES ---
//   const [formData, setFormData] = useState({
//     adresse: '',
//     telephone: '',
//     commentaire: ''
//   });

//   useEffect(() => {
//   const token = localStorage.getItem('access_token');
  
//   if (!token) {
//     // Si quelqu'un arrive ici sans être connecté, on le renvoie fissa au login
//     navigate('/login');
//   }
// }, [navigate]);

//   // useEffect pour aller chercher les infos de l'utilisateur dès qu'il arrive sur la page
//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem('access_token');
//       if (token) {
//         try {
//           // Remplace par la route exacte de ton backend si tu as fait un /me/
//           // Ici je simule la récupération des infos basées sur l'utilisateur connecté
//           const response = await axios.get('http://127.0.0.1:8000/api/accounts/utilisateurs/', {
//             headers: { Authorization: `Bearer ${token}` }
//           });
          
//           // Si l'API renvoie une liste, on prend le premier qui correspond (ou ajuste selon ton API)
//           const user = response.data[0]; 
//           if(user) {
//              setFormData(prev => ({
//                ...prev,
//                adresse: user.adresse || '',
//                telephone: user.telephone || ''
//              }));
//           }
//         } catch (error) {
//           console.error("Impossible de récupérer les infos de l'utilisateur", error);
//         }
//       }
//     };
//     fetchUserData();
//   }, []);

//   const [paymentMethod, setPaymentMethod] = useState('livraison');
  
//   if (cart.length === 0 && !isOrdered) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//         <h2 className="text-2xl font-bold mb-4 text-gray-400">Votre panier est vide</h2>
//         <Link to="/restaurants" className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100">
//           Découvrir nos restaurants
//         </Link>
//       </div>
//     );
//   }

//   const fraisLivraison = 3.500;
//   const totalGeneral = cartTotal + fraisLivraison;

//   const handleSubmitOrder = async (e) => {
//     e.preventDefault();
//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       alert("Vous devez être connecté pour passer une commande.");
//       setIsSubmitting(false);
//       navigate('/login');
//       return;
//     }

//     // 1. Préparation des articles de la commande (CommandeItem)
//     const items = cart.map(item => ({
//       plat: item.id, // L'ID du plat dans la base de données
//       quantite: item.quantity,
//       prix_unitaire: item.prix,
//       sous_total: parseFloat(item.prix) * item.quantity
//     }));

//     // 2. Préparation du payload global de la commande
//     // On prend l'ID du restaurant du 1er plat du panier
//     const restaurantId = cart[0].restaurant?.id || cart[0].restaurant; 

//     // ATTENTION: Assure-toi que state paymentMethod contient bien 'mobile_money' et non 'mobile'
//     const payload = {
//       restaurant: restaurantId,
//       total: totalGeneral,
//       adresse_livraison: formData.adresse,
//       mode_paiement: paymentMethod, // Doit être 'carte', 'livraison' ou 'mobile_money'
//       items: items // Django devra boucler sur ça pour créer les CommandeItem
//     };

//     try {
//       // 3. Envoi à l'API Django
//       const response = await axios.post('http://127.0.0.1:8000/api/orders/commandes/', payload, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log("Commande enregistrée avec succès:", response.data);
      
//       // 4. Succès de la commande
//       setIsOrdered(true);
//       setTimeout(() => clearCart(), 500);
      
//     } catch (error) {
//       const apiError = error.response?.data || error.message;
//       console.error("Erreur API:", apiError);
//       alert(`Une erreur est survenue lors de l'enregistrement de la commande : ${JSON.stringify(apiError)}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   // --- ÉCRAN DE SUCCÈS ANIMÉ ---
//   if (isOrdered) {
//     return (
//       <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
//         <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
//           <Check size={48} className="text-green-600" strokeWidth={4} />
//         </div>
//         <h1 className="text-4xl font-black text-gray-900 mb-4 text-center">Commande validée !</h1>
//         <p className="text-gray-500 text-lg text-center max-w-md mb-10 font-medium">
//           Merci, votre repas est en cours de préparation. Vous pouvez suivre l'état de votre livraison dans votre historique.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
//           <button onClick={() => navigate('/')} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
//             Retour à l'accueil
//           </button>
//           <button onClick={() => navigate('/orderhistory')} className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all">
//             Voir l'historique
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-7xl mx-auto"> {/* Élargi le conteneur principal */}
        
//         <h1 className="text-3xl font-black text-gray-900 mb-8">Finaliser la commande</h1>

//         <div className="flex items-center gap-4 mb-12 max-w-3xl text-sm font-bold">
//            {/* ... (Barre de progression inchangée) ... */}
//            <div className={`flex items-center gap-2 transition-colors ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-300'}`}>
//             <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep >= 1 ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-white'}`}>1</span>
//             <span className="hidden sm:inline">Livraison</span>
//           </div>
//           <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
//           <div className={`flex items-center gap-2 transition-colors ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-300'}`}>
//             <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep >= 2 ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-white'}`}>2</span>
//             <span className="hidden sm:inline">Paiement</span>
//           </div>
//           <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
//           <div className={`flex items-center gap-2 transition-colors ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-300'}`}>
//             <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep >= 3 ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-white'}`}>3</span>
//             <span className="hidden sm:inline">Récapitulatif</span>
//           </div>
//         </div>

//         {/* --- CHANGEMENT DE GRILLE : 7 colonnes pour les formulaires, 5 pour le récap --- */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
//           <div className="lg:col-span-7 space-y-8">
            
//             {/* ETAPE 1 : LIVRAISON */}
//             <div className={`bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 transition-all ${currentStep !== 1 && 'opacity-50 pointer-events-none grayscale-[0.5]'}`}>
//               <div className="flex justify-between items-center mb-8">
//                 <h2 className="text-xl font-black text-gray-900">1. Adresse de livraison</h2>
//                 {currentStep > 1 && <CheckCircle2 className="text-green-500" size={24} />}
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Adresse exacte</label>
//                   <input type="text" placeholder="Ex: Résidence les pins, Lac 2, Tunis" value={formData.adresse} 
//                     onChange={(e) => setFormData({...formData, adresse: e.target.value})}
//                     className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Téléphone</label>
//                   <input type="tel" placeholder="216 -- --- ---" value={formData.telephone}
//                     onChange={(e) => setFormData({...formData, telephone: e.target.value})}
//                     className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Commentaire</label>
//                   <input type="text" placeholder="Code porte, étage..." value={formData.commentaire}
//                     onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
//                     className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium" />
//                 </div>
//                 {currentStep === 1 && (
//                   <div className="md:col-span-2 flex justify-end mt-2">
//                     <button onClick={() => setCurrentStep(2)} disabled={!formData.adresse || !formData.telephone}
//                       className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
//                       Continuer vers le paiement <ArrowRight size={18} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* ETAPE 2 : PAIEMENT */}
//             <div className={`bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 transition-all ${currentStep < 2 && 'opacity-40 grayscale'} ${currentStep > 2 && 'opacity-50'}`}>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-black text-gray-900">2. Mode de paiement</h2>
//                 {currentStep > 2 && <CheckCircle2 className="text-green-500" size={24} />}
//               </div>
              
//               <div className="space-y-4">
                
//                 {/* OPTION 1 : CASH */}
//                 <div 
//                   onClick={() => currentStep === 2 && setPaymentMethod('livraison')}
//                   className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
//                     paymentMethod === 'livraison' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
//                   }`}>
//                   <div className="flex items-center gap-4">
//                     <div className={`p-3 rounded-xl ${paymentMethod === 'livraison' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
//                       <Truck size={24}/>
//                     </div>
//                     <div>
//                       <h3 className={`font-bold ${paymentMethod === 'livraison' ? 'text-orange-900' : 'text-gray-900'}`}>Paiement à la livraison</h3>
//                       <p className="text-xs text-gray-500 mt-1">Payez en espèces lorsque le livreur arrive.</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* OPTION 2 : CARTE BANCAIRE AVEC FORMULAIRE */}
//                 <div 
//                   className={`p-5 rounded-2xl border-2 transition-all ${
//                     paymentMethod === 'carte' ? 'border-orange-500 bg-white' : 'border-gray-100 hover:border-gray-200 cursor-pointer'
//                   }`}>
//                   <div className="flex items-center gap-4" onClick={() => currentStep === 2 && setPaymentMethod('carte')}>
//                     <div className={`p-3 rounded-xl ${paymentMethod === 'carte' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
//                       <CreditCard size={24}/>
//                     </div>
//                     <div className="flex-1">
//                       <h3 className={`font-bold flex items-center gap-2 ${paymentMethod === 'carte' ? 'text-orange-900' : 'text-gray-900'}`}>
//                         Carte bancaire <Lock size={14} className="text-green-600" />
//                       </h3>
//                       <p className="text-xs text-gray-500 mt-1">Paiement sécurisé en ligne.</p>
//                     </div>
//                   </div>

//                   {/* Formulaire de carte qui s'ouvre */}
//                   {paymentMethod === 'carte' && currentStep === 2 && (
//                     <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 animate-fadeIn">
//                       <div className="col-span-2">
//                         <label className="block text-xs font-bold text-gray-500 mb-1">Numéro de carte</label>
//                         <input type="text" placeholder="0000 0000 0000 0000" maxLength="19"
//                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none" />
//                       </div>
//                       <div>
//                         <label className="block text-xs font-bold text-gray-500 mb-1">Date d'exp.</label>
//                         <input type="text" placeholder="MM/AA" maxLength="5"
//                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none" />
//                       </div>
//                       <div>
//                         <label className="block text-xs font-bold text-gray-500 mb-1">CVV</label>
//                         <input type="text" placeholder="123" maxLength="3"
//                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none" />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* OPTION 3 : MOBILE MONEY AVEC FORMULAIRE */}
//                 <div 
//                   className={`p-5 rounded-2xl border-2 transition-all ${
//                     paymentMethod === 'mobile_money' ? 'border-orange-500 bg-white' : 'border-gray-100 hover:border-gray-200 cursor-pointer'
//                   }`}>
//                   <div className="flex items-center gap-4" onClick={() => currentStep === 2 && setPaymentMethod('mobile_money')}>
//                     <div className={`p-3 rounded-xl ${paymentMethod === 'mobile_money' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
//                       <Wallet size={24}/>
//                     </div>
//                     <div>
//                       <h3 className={`font-bold ${paymentMethod === 'mobile_money' ? 'text-orange-900' : 'text-gray-900'}`}>Mobile Money (Flouci)</h3>
//                       <p className="text-xs text-gray-500 mt-1">Payez directement depuis votre smartphone.</p>
//                     </div>
//                   </div>

//                   {paymentMethod === 'mobile_money' && currentStep === 2 && (
//                     <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
//                       <label className="block text-xs font-bold text-gray-500 mb-1">Numéro de téléphone associé au compte</label>
//                       <div className="flex gap-2">
//                         <span className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold">+216</span>
//                         <input type="tel" placeholder="XX XXX XXX" defaultValue={formData.telephone}
//                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none" />
//                       </div>
//                       <p className="text-xs text-gray-400 mt-2">Un code de confirmation sera envoyé sur ce numéro.</p>
//                     </div>
//                   )}
//                 </div>

//               </div>

//               {currentStep === 2 && (
//                 <div className="flex justify-between items-center mt-8">
//                   <button onClick={() => setCurrentStep(1)} className="px-6 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors">
//                     Retour
//                   </button>
//                   <button onClick={() => setCurrentStep(3)} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
//                     Vérifier la commande <ArrowRight size={18} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RÉCAPITULATIF STICKY (ÉLARGIT À 5 COLONNES) */}
//           <div className="lg:col-span-5">
//             <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-28">
//               <h2 className="text-xl font-black text-gray-900 mb-6">Récapitulatif de commande</h2>
              
//               <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2">
//                 {cart.map(item => (
//                   <div key={item.id} className="flex gap-4 items-center group">
//                     <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
//                       <img src={item.image} alt={item.nom} className="w-full h-full object-cover" />
//                     </div>
//                     <div className="flex flex-col flex-1">
//                       <span className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.nom}</span>
//                       <span className="text-xs font-medium text-gray-400 mt-1">Quantité : {item.quantity}</span>
//                     </div>
//                     <span className="font-bold text-gray-900 shrink-0">{(parseFloat(item.prix) * item.quantity).toFixed(3)} DT</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
//                 <div className="flex justify-between text-gray-500 font-medium">
//                   <span>Sous-total</span>
//                   <span>{cartTotal.toFixed(3)} DT</span>
//                 </div>
//                 <div className="flex justify-between text-gray-500 font-medium">
//                   <span>Frais de livraison</span>
//                   <span>{fraisLivraison.toFixed(3)} DT</span>
//                 </div>
//                 <div className="flex justify-between items-center pt-4 border-t border-gray-200">
//                   <span className="text-lg font-black text-gray-900">Total à payer</span>
//                   <span className="text-2xl font-black text-orange-600">{totalGeneral.toFixed(3)} DT</span>
//                 </div>
//               </div>

//               {currentStep === 3 ? (
//                 <button onClick={handleSubmitOrder} disabled={isSubmitting}
//                   className="w-full mt-8 py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all active:scale-95 animate-pulse flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
//                   <CheckCircle2 size={24} /> {isSubmitting ? "Enregistrement..." : "Valider & Payer"}
//                 </button>
//               ) : (
//                 <div className="mt-8 p-4 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-bold text-center">
//                    Veuillez valider vos informations de livraison et de paiement pour confirmer.
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import {
	CheckCircle2,
	CreditCard,
	Wallet,
	Truck,
	ArrowRight,
	Check,
	Lock,
} from "lucide-react";

export default function Checkout() {
	const navigate = useNavigate();
	const { cart, cartTotal, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1); 
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ adresse: '', telephone: '', commentaire: '' });

  // RÉCUPÉRATION DES CARTES SAUVEGARDÉES DEPUIS LE PROFIL
  const [savedCards, setSavedCards] = useState(() => {
    const saved = localStorage.getItem('simulated_cards');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCardId, setSelectedCardId] = useState(null); // Savoir quelle carte est cochée

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/accounts/utilisateurs/');
        const users = response.data.results || response.data;
        const user = users[0]; 
        if(user) {
           setFormData(prev => ({ ...prev, adresse: user.adresse || '', telephone: user.telephone || '' }));
        }
      } catch (error) {
        console.error("Erreur", error);
      }
    };
    fetchUserData();
  }, []);

  const [paymentMethod, setPaymentMethod] = useState('livraison');
  
  if (cart.length === 0 && !isOrdered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-gray-400">Votre panier est vide</h2>
        <Link to="/restaurants" className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100">
          Découvrir nos restaurants
        </Link>
      </div>
    );
  }

  const fraisLivraison = 3.500;
  const totalGeneral = cartTotal + fraisLivraison;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Si on a choisi carte mais qu'on n'a pas sélectionné laquelle !
    if (paymentMethod === 'carte' && savedCards.length > 0 && !selectedCardId) {
        alert("Veuillez sélectionner une carte bancaire.");
        return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    const items = cart.map(item => ({
      plat: item.id,
      quantite: item.quantity,
      prix_unitaire: item.prix,
      sous_total: parseFloat(item.prix) * item.quantity
    }));

    const restaurantId = cart[0].restaurant?.id || cart[0].restaurant; 

    const payload = {
      restaurant: restaurantId,
      total: totalGeneral,
      adresse_livraison: formData.adresse,
      mode_paiement: paymentMethod, 
      items: items 
    };

    try {
      const response = await api.post('/orders/commandes/', payload);
      setIsOrdered(true);
      setTimeout(() => clearCart(), 500);
    } catch (error) {
      const apiError = error.response?.data || error.message;
      console.error("Erreur API:", apiError);
      alert(`Erreur : ${typeof apiError === 'object' ? JSON.stringify(apiError) : apiError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <Check size={48} className="text-green-600" strokeWidth={4} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 text-center">Commande validée !</h1>
        <p className="text-gray-500 text-lg text-center max-w-md mb-10 font-medium">
          Merci, votre repas est en cours de préparation. Vous pouvez suivre l'état de votre livraison dans votre historique.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button onClick={() => navigate('/')} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
            Retour à l'accueil
          </button>
          <button onClick={() => navigate('/orderhistory')} className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all">
            Voir l'historique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Finaliser la commande</h1>

        <div className="flex items-center gap-4 mb-12 max-w-3xl text-sm font-bold">
           {/* ... (Barre de progression inchangée) ... */}
           <div className={`flex items-center gap-2 transition-colors ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-300'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep >= 1 ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-white'}`}>1</span>
            <span className="hidden sm:inline">Livraison</span>
          </div>
          <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 transition-colors ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-300'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep >= 2 ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-white'}`}>2</span>
            <span className="hidden sm:inline">Paiement</span>
          </div>
          <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 transition-colors ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-300'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep >= 3 ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-white'}`}>3</span>
            <span className="hidden sm:inline">Récapitulatif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            {/* ETAPE 1 : LIVRAISON */}
            <div className={`bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 transition-all ${currentStep !== 1 && 'opacity-50 pointer-events-none grayscale-[0.5]'}`}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-gray-900">1. Adresse de livraison</h2>
                {currentStep > 1 && <CheckCircle2 className="text-green-500" size={24} />}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Adresse exacte</label>
                  <input type="text" placeholder="Ex: Résidence les pins, Lac 2, Tunis" value={formData.adresse} 
                    onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Téléphone</label>
                  <input type="tel" placeholder="216 -- --- ---" value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Commentaire</label>
                  <input type="text" placeholder="Code porte, étage..." value={formData.commentaire}
                    onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium" />
                </div>
                {currentStep === 1 && (
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button onClick={() => setCurrentStep(2)} disabled={!formData.adresse || !formData.telephone}
                      className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                      Continuer vers le paiement <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ETAPE 2 : PAIEMENT */}
            <div className={`bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 transition-all ${currentStep < 2 && 'opacity-40 grayscale'} ${currentStep > 2 && 'opacity-50'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">2. Mode de paiement</h2>
                {currentStep > 2 && <CheckCircle2 className="text-green-500" size={24} />}
              </div>
              
              <div className="space-y-4">
                
                {/* OPTION 1 : CASH */}
                <div 
                  onClick={() => currentStep === 2 && setPaymentMethod('livraison')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'livraison' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${paymentMethod === 'livraison' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Truck size={24}/>
                    </div>
                    <div>
                      <h3 className={`font-bold ${paymentMethod === 'livraison' ? 'text-orange-900' : 'text-gray-900'}`}>Paiement à la livraison</h3>
                      <p className="text-xs text-gray-500 mt-1">Payez en espèces lorsque le livreur arrive.</p>
                    </div>
                  </div>
                </div>

                {/* OPTION 2 : CARTE BANCAIRE (MODIFIÉE POUR LISTER LES CARTES DU PROFIL) */}
                <div 
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'carte' ? 'border-orange-500 bg-white' : 'border-gray-100 hover:border-gray-200 cursor-pointer'
                  }`}>
                  <div className="flex items-center gap-4" onClick={() => {
                      if(currentStep === 2) {
                          setPaymentMethod('carte');
                          // On pré-sélectionne la première carte si elle existe
                          if(savedCards.length > 0 && !selectedCardId) setSelectedCardId(savedCards[0].id);
                      }
                  }}>
                    <div className={`p-3 rounded-xl ${paymentMethod === 'carte' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      <CreditCard size={24}/>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold flex items-center gap-2 ${paymentMethod === 'carte' ? 'text-orange-900' : 'text-gray-900'}`}>
                        Carte bancaire <Lock size={14} className="text-green-600" />
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Paiement sécurisé en ligne.</p>
                    </div>
                  </div>

                  {/* LISTE DES CARTES DU PROFIL */}
                  {paymentMethod === 'carte' && currentStep === 2 && (
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 animate-fadeIn">
                      {savedCards.length > 0 ? (
                          savedCards.map(card => (
                              <div key={card.id} onClick={() => setSelectedCardId(card.id)} 
                                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${selectedCardId === card.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                  <div className="flex items-center gap-3">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCardId === card.id ? 'border-orange-600' : 'border-gray-300'}`}>
                                          {selectedCardId === card.id && <div className="w-2 h-2 bg-orange-600 rounded-full"></div>}
                                      </div>
                                      <span className="font-bold text-gray-800">{card.brand} terminant par {card.last4}</span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-500">Exp: {card.exp}</span>
                              </div>
                          ))
                      ) : (
                          // Si l'utilisateur n'a pas enregistré de carte dans son profil
                          <div className="p-4 bg-gray-50 rounded-xl text-center">
                              <p className="text-sm text-gray-500 font-bold mb-3">Vous n'avez pas de carte enregistrée.</p>
                              <Link to="/profile" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold">
                                Ajouter une carte dans mon profil
                              </Link>
                          </div>
                      )}
                    </div>
                  )}
                </div>

                {/* OPTION 3 : MOBILE MONEY */}
                <div 
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'mobile_money' ? 'border-orange-500 bg-white' : 'border-gray-100 hover:border-gray-200 cursor-pointer'
                  }`}>
                  <div className="flex items-center gap-4" onClick={() => currentStep === 2 && setPaymentMethod('mobile_money')}>
                    <div className={`p-3 rounded-xl ${paymentMethod === 'mobile_money' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Wallet size={24}/>
                    </div>
                    <div>
                      <h3 className={`font-bold ${paymentMethod === 'mobile_money' ? 'text-orange-900' : 'text-gray-900'}`}>Mobile Money (Flouci)</h3>
                      <p className="text-xs text-gray-500 mt-1">Payez directement depuis votre smartphone.</p>
                    </div>
                  </div>

                  {paymentMethod === 'mobile_money' && currentStep === 2 && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Numéro de téléphone associé au compte</label>
                      <div className="flex gap-2">
                        <span className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold">+216</span>
                        <input type="tel" placeholder="XX XXX XXX" defaultValue={formData.telephone}
                          onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Un code de confirmation sera envoyé sur ce numéro.</p>
                    </div>
                  )}
                </div>

              </div>

              {currentStep === 2 && (
                <div className="flex justify-between items-center mt-8">
                  <button onClick={() => setCurrentStep(1)} className="px-6 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors">
                    Retour
                  </button>
                  <button onClick={() => setCurrentStep(3)} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                    Vérifier la commande <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RÉCAPITULATIF */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-xl font-black text-gray-900 mb-6">Récapitulatif de commande</h2>
              
              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.nom}</span>
                      <span className="text-xs font-medium text-gray-400 mt-1">Quantité : {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">{(parseFloat(item.prix) * item.quantity).toFixed(3)} DT</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Sous-total</span>
                  <span>{cartTotal.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Frais de livraison</span>
                  <span>{fraisLivraison.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-black text-gray-900">Total à payer</span>
                  <span className="text-2xl font-black text-orange-600">{totalGeneral.toFixed(3)} DT</span>
                </div>
              </div>

              {currentStep === 3 ? (
                <button onClick={handleSubmitOrder} disabled={isSubmitting}
                  className="w-full mt-8 py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all active:scale-95 animate-pulse flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <CheckCircle2 size={24} /> {isSubmitting ? "Enregistrement..." : "Valider & Payer"}
                </button>
              ) : (
                <div className="mt-8 p-4 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-bold text-center">
                   Veuillez valider vos informations de livraison et de paiement pour confirmer.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}