import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api'; // Ajuste le chemin selon ton dossier
import toast from 'react-hot-toast';

// 🚨 Remplace ceci par TA CLÉ PUBLIQUE STRIPE (pk_test_...)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// --- LE FORMULAIRE INTERNE DE STRIPE ---
// Dans StripePayment.jsx
const CheckoutForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // C'est ici que l'argent est prélevé !
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message);
      if (onError) onError(); // On dit au bouton vert d'arrêter de tourner
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success("Paiement validé !");
      onSuccess(); // On lance la création de la commande Django
    }
  };

  return (
    <form onSubmit={handleSubmit} id="stripe-payment-form">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <PaymentElement />
      </div>

      {/* LE FAMEUX BOUTON CACHÉ */}
      {/* Il est invisible, mais le bouton "Valider & Payer" de l'étape 3 va cliquer dessus à distance */}
      <button type="submit" id="hidden-stripe-submit" className="hidden">
        Submit caché
      </button>
    </form>
  );
};

// // N'oublie pas d'ajouter la prop "onError" dans le composant parent :
// export default function StripePayement({ amount, onSuccess, onError }) {
//     // ... le reste du code de ton composant ne change pas ...
//     return (
//       <Elements stripe={stripePromise} options={{ clientSecret }}>
//         <CheckoutForm onSuccess={onSuccess} onError={onError} />
//       </Elements>
//     );
// }
// --- LE CONTENEUR PRINCIPAL QUI PARLE À DJANGO ---
export default function StripePayement({ amount, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Dès que le composant s'affiche, on demande l'autorisation à Django
    const fetchPaymentIntent = async () => {
      try {
        // Attention : Stripe prend des centimes, donc 35.500 DT -> 3550
        // Pour l'EUR (configuré en backend), on multiplie par 100
        const amountInCents = Math.round(parseFloat(amount) * 100);
        console.log("Creating PaymentIntent for amount:", amountInCents);
        const response = await api.post('/catalog/create-payment-intent/', { amount: amountInCents });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Erreur d'initialisation Stripe:", error);
        const message = error.response?.data?.error || "Impossible de contacter le serveur bancaire.";
        toast.error(message);
      }
    };
    fetchPaymentIntent();
  }, [amount]);

  if (!clientSecret) {
    return <div className="text-center p-4 text-gray-500 font-bold animate-pulse">Connexion sécurisée en cours...</div>;
  }

  // On englobe le formulaire avec la clé publique et l'autorisation secrète
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} onError={onError}/>
    </Elements>
  );
}