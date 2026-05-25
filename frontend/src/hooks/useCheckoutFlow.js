import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export function useCheckoutFlow() {
  const navigate                = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  const [currentStep, setCurrentStep]               = useState(1);
  const [isOrdered, setIsOrdered]                   = useState(false);
  const [isSubmitting, setIsSubmitting]             = useState(false);
  const [formData, setFormData]                     = useState({ adresse: '', telephone: '', commentaire: '' });
  const [paymentMethod, setPaymentMethod]           = useState('livraison');
  const [showMobileMoneyInput, setShowMobileMoneyInput] = useState(false);
  const [mobileMoneyNumber, setMobileMoneyNumber]   = useState('');

  const fraisLivraison = 3.500;
  const totalGeneral   = cartTotal + fraisLivraison;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/accounts/utilisateurs/');
        const users = response.data.results || response.data;
        const user  = users[0];
        if (user) {
          setFormData(prev => ({ ...prev, adresse: user.adresse || '', telephone: user.telephone || '' }));
          setMobileMoneyNumber(user.telephone || '');
        }
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    const items = cart.map(item => ({
      plat: item.id,
      quantite: item.quantity,
      prix_unitaire: item.prix,
      sous_total: parseFloat(item.prix) * item.quantity,
    }));

    const restaurantId = cart[0].restaurant?.id || cart[0].restaurant;

    const payload = {
      restaurant: restaurantId,
      total: totalGeneral,
      adresse_livraison: formData.adresse,
      telephone_paiement: paymentMethod === 'mobile_money'
        ? (mobileMoneyNumber || formData.telephone)
        : formData.telephone,
      mode_paiement: paymentMethod,
      items,
    };

    try {
      await api.post('/orders/commandes/', payload);
      setIsOrdered(true);
      setTimeout(() => clearCart(), 500);
    } catch (error) {
      console.error('Erreur API:', error);
      alert("Une erreur est survenue lors de l'enregistrement de la commande.");
      setIsSubmitting(false);
    }
  };

  return {
    cart, cartTotal, clearCart,
    currentStep, setCurrentStep,
    isOrdered, isSubmitting, setIsSubmitting,
    formData, setFormData,
    paymentMethod, setPaymentMethod,
    showMobileMoneyInput, setShowMobileMoneyInput,
    mobileMoneyNumber, setMobileMoneyNumber,
    fraisLivraison, totalGeneral,
    handleSubmitOrder,
    navigate,
  };
}
