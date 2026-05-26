import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Initialisation asynchrone de l'instance Stripe.
 * Utilise la clé publique définie dans les variables d'environnement (Vite).
 */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * Composant de formulaire interne géré par Stripe.
 * 
 * Ce composant doit impérativement être enveloppé par un composant <Elements>
 * pour accéder aux hooks useStripe() et useElements().
 * 
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback appelé après un paiement réussi.
 * @param {Function} props.onError - Callback appelé en cas d'échec pour débloquer l'UI parente.
 */
const CheckoutForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();

  /**
   * Gère la soumission du paiement vers les serveurs de Stripe.
   * 
   * Processus :
   * 1. Validation de la présence de l'instance Stripe.
   * 2. Confirmation du paiement avec les éléments saisis (CB, etc.).
   * 3. 'redirect: "if_required"' permet de gérer les 3D Secure sans rechargement de page si possible.
   * 4. En cas de succès ('succeeded'), déclenche la logique de création de commande.
   */
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!stripe || !elements) return;

    // Déclenchement de la transaction réelle.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      // Erreur utilisateur (ex: carte refusée, expiration, etc.)
      toast.error(error.message);
      if (onError) onError();
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Succès critique : le client a été prélevé.
      toast.success("Paiement sécurisé validé !");
      onSuccess(); // Propagation vers useCheckoutFlow pour enregistrer la commande en base.
    }
  };

  return (
    <form onSubmit={handleSubmit} id="stripe-payment-form">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        {/* Composant Stripe tout-en-un (Cartes, Portefeuilles, etc.) */}
        <PaymentElement />
      </div>

      {/* 
          ASTUCE TECHNIQUE : Bouton caché.
          Le bouton principal de validation se trouve dans le composant Checkout.jsx.
          Pour déclencher ce formulaire à distance, on utilise un document.getElementById('hidden-stripe-submit').click().
      */}
      <button type="submit" id="hidden-stripe-submit" className="hidden">
        Submit caché
      </button>
    </form>
  );
};

/**
 * Composant principal pour l'intégration Stripe (Payment Element).
 * 
 * Ce composant orchestre :
 * 1. La demande d'un clientSecret au backend Django.
 * 2. L'affichage sécurisé du formulaire de paiement.
 * 
 * 👉 Voir les détails d'implémentation dans README.md, section "Gestion du Tunnel Stripe".
 * 
 * @param {Object} props
 * @param {number} props.amount - Montant de la transaction (en unité standard, ex: 10.50).
 * @param {Function} props.onSuccess - Action à mener après validation bancaire.
 * @param {Function} props.onError - Action à mener en cas de refus bancaire.
 */
export default function StripePayement({ amount, onSuccess, onError }) {
  /** @type {string} Le jeton secret permettant d'identifier la transaction auprès de Stripe. */
  const [clientSecret, setClientSecret] = useState("");

  /**
   * Effet de montage : Sollicite le backend pour créer une intention de paiement.
   * S'exécute à chaque changement de montant.
   */
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        // Stripe exige des centimes. Conversion : 35.50 -> 3550.
        const amountInCents = Math.round(parseFloat(amount) * 100);
        
        // Appel au service Django (catalog/services.py -> create_payment_intent).
        const response = await api.post('/catalog/create-payment-intent/', { 
          amount: amountInCents 
        });
        
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Erreur d'initialisation Stripe:", error);
        const message = error.response?.data?.error || "Connexion au service de paiement impossible.";
        toast.error(message);
        if (onError) onError();
      }
    };

    if (amount > 0) fetchPaymentIntent();
  }, [amount, onError]);

  // État d'attente pendant la communication avec le backend/Stripe.
  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 italic">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
        Initialisation du tunnel de paiement sécurisé...
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} onError={onError}/>
    </Elements>
  );
}