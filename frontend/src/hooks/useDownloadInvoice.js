import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

/**
 * Hook personnalisé pour gérer le téléchargement des factures au format PDF.
 * 
 * Ce hook encapsule la logique complexe de récupération d'un flux binaire (Blob)
 * depuis l'API Django et sa conversion en un fichier téléchargeable par le navigateur.
 * 
 * @returns {Object} Un objet contenant la fonction downloadInvoice et l'état loading.
 */
export const useDownloadInvoice = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Déclenche le téléchargement de la facture pour une commande donnée.
   * 
   * @param {number|string} orderId - L'identifiant unique de la commande.
   * @param {string} orderNumber - Le numéro de facture ou de commande (pour le nom du fichier).
   */
  const downloadInvoice = async (orderId, orderNumber = '') => {
    try {
      setLoading(true);

      /**
       * ÉTAPE 1 : Appel API avec responseType 'blob'
       * 
       * Par défaut, Axios traite les réponses comme du JSON. Pour recevoir un fichier binaire (PDF),
       * nous devons spécifier 'blob'. Un Blob (Binary Large Object) représente des données
       * brutes qui ne sont pas nécessairement dans un format lisible par JavaScript (texte/JSON).
       */
      const response = await api.get(`/orders/commandes/${orderId}/facture/`, {
        responseType: 'blob',
      });

      /**
       * ÉTAPE 2 : Création du Blob
       * 
       * Nous créons un nouvel objet Blob à partir des données reçues, en spécifiant
       * explicitement le type MIME 'application/pdf'.
       */
      const blob = new Blob([response.data], { type: 'application/pdf' });

      /**
       * ÉTAPE 3 : Génération d'une URL d'objet (Object URL)
       * 
       * window.URL.createObjectURL() crée une URL temporaire (commençant par blob:) 
       * pointant vers l'objet Blob stocké en mémoire RAM par le navigateur.
       * Cette URL peut être utilisée comme source pour un lien <a> ou une <iframe>.
       */
      const url = window.URL.createObjectURL(blob);

      /**
       * ÉTAPE 4 : Simulation d'un clic sur un lien invisible
       * 
       * Pour forcer le téléchargement sans que l'utilisateur ne quitte la page,
       * on crée dynamiquement un élément <a>, on lui assigne l'URL du blob,
       * on définit l'attribut 'download' (qui indique au navigateur de télécharger au lieu d'ouvrir),
       * puis on déclenche programmatiquement l'événement .click().
       */
      const link = document.createElement('a');
      link.href = url;
      const fileName = orderNumber ? `Facture_${orderNumber}.pdf` : `Facture_Commande_${orderId}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      /**
       * ÉTAPE 5 : Nettoyage de la mémoire
       * 
       * Les Object URLs consomment de la RAM tant qu'elles ne sont pas révoquées.
       * Une fois le clic effectué, nous supprimons le lien du DOM et révoquons l'URL
       * pour libérer les ressources.
       */
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Facture téléchargée avec succès !');
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
      toast.error('Impossible de générer la facture. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return { downloadInvoice, loading };
};
