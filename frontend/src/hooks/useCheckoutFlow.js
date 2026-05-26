import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * Custom Hook gérant l'intégralité du tunnel de commande (Checkout).
 * 
 * Ce hook centralise la logique métier, la gestion d'état et les interactions API
 * nécessaires pour transformer un panier en une commande finalisée.
 * 
 * Responsabilités :
 * - Vérification de l'authentification.
 * - Gestion de la progression par étapes (Coordonnées -> Paiement -> Confirmation).
 * - Synchronisation des données utilisateur (adresse, téléphone) depuis le profil.
 * - Calcul des totaux (panier + frais de livraison).
 * - Soumission de la commande finale au backend Django.
 * 
 * @returns {Object} Un ensemble d'états et de fonctions pour piloter l'UI du Checkout.
 */
export function useCheckoutFlow() {
  const navigate = useNavigate();
  
  /** @type {Object} Accès au contexte du panier (items, total, fonction de vidage). */
  const { cart, cartTotal, clearCart } = useCart();

  // --- ÉTATS DE NAVIGATION & STATUT ---
  /** @type {number} Étape actuelle du tunnel (1: Coordonnées, 2: Mode Paiement, 3: Récapitulatif). */
  const [currentStep, setCurrentStep] = useState(1);
  /** @type {boolean} Indique si la commande a été enregistrée avec succès. */
  const [isOrdered, setIsOrdered] = useState(false);
  /** @type {boolean} État de chargement lors de l'envoi de la requête API. */
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ÉTATS DES DONNÉES DE COMMANDE ---
  /** @type {Object} Informations de livraison saisies par l'utilisateur. */
  const [formData, setFormData] = useState({ 
    adresse: '', 
    telephone: '', 
    commentaire: '' 
  });
  /** @type {string} Moyen de paiement choisi ('livraison', 'mobile_money', 'stripe'). */
  const [paymentMethod, setPaymentMethod] = useState('livraison');
  /** @type {boolean} Toggle pour l'affichage du champ spécifique au Mobile Money. */
  const [showMobileMoneyInput, setShowMobileMoneyInput] = useState(false);
  /** @type {string} Numéro spécifique pour le prélèvement Mobile Money. */
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  /** @type {number} Frais de livraison récupérés depuis le backend. */
  const [fraisLivraison, setFraisLivraison] = useState(3.500);
  /** @type {Object|null} Commande créée avec succès (pour téléchargement facture). */
  const [lastOrder, setLastOrder] = useState(null);

  // --- LOGIQUE DE CALCUL ---
  /** @const {number} Montant total final à payer. */
  const totalGeneral = cartTotal + fraisLivraison;

  // --- EFFETS ---

  /**
   * Récupère les frais de livraison configurés au backend.
   */
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      try {
        const response = await api.get('/orders/delivery-fee/');
        setFraisLivraison(parseFloat(response.data));
      } catch (error) {
        console.error('Erreur lors de la récupération des frais de livraison:', error);
      }
    };
    fetchDeliveryFee();
  }, []);

  /**
   * Sécurité : Redirige vers la page de connexion si le jeton d'accès est absent.
   * S'exécute au montage du composant.
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) navigate('/login');
  }, [navigate]);

  /**
   * Pré-remplissage : Récupère les informations par défaut de l'utilisateur (adresse/tel)
   * pour améliorer l'expérience utilisateur (UX).
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/accounts/utilisateurs/');
        const users = response.data.results || response.data;
        // On prend le premier profil retourné (lié à l'utilisateur actuel).
        const user = users[0];
        if (user) {
          setFormData(prev => ({ 
            ...prev, 
            adresse: user.adresse || '', 
            telephone: user.telephone || '' 
          }));
          setMobileMoneyNumber(user.telephone || '');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };
    fetchUserData();
  }, []);

  /**
   * Finalise la commande en envoyant le payload au backend.
   * 
   * Cette fonction prépare les données au format attendu par le Serializer Django :
   * - Transformation des items du panier en lignes de commande.
   * - Identification du restaurant concerné (basé sur le premier item).
   * - Gestion dynamique du numéro de téléphone selon le mode de paiement.
   * 
   * @param {Event} [e] L'événement de soumission de formulaire (optionnel).
   */
  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    // Formatage des lignes de commande pour l'ORM Django.
    const items = cart.map(item => ({
      plat: item.id,
      quantite: item.quantity,
      prix_unitaire: item.prix,
      sous_total: parseFloat(item.prix) * item.quantity,
    }));

    // On suppose que tous les plats du panier proviennent du même restaurant.
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
      // Envoi de la commande à l'API. 
      // 👉 Voir les détails du traitement backend dans orders/services.py.
      const response = await api.post('/orders/commandes/', payload);
      
      setLastOrder(response.data);
      setIsOrdered(true);
      // On vide le panier après un court délai pour laisser l'animation de succès se jouer.
      setTimeout(() => clearCart(), 500);
    } catch (error) {
      console.error('Erreur API lors de la commande:', error);
      alert("Une erreur est survenue. Veuillez vérifier vos informations de livraison.");
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
    lastOrder,
    navigate,
  };
}
