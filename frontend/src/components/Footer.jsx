
import React from 'react';
import { Share2, Globe, Utensils, Cherry } from 'lucide-react';
import logoImg from '../assets/foodCategoriesImg/logo.png';
import { Link } from 'react-router-dom';
import {useState} from "react";
import toast from "react-hot-toast";

export default function Footer() {

  const [newsletterData, setNewsletterData] = useState({email: "", valid: false});

  // 2. Gestion de la soumission et du LocalStorage
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();

    const emailTrimmed = newsletterData.email.trim();

    // Vérification basique
    if (emailTrimmed === "") {
      toast.error("Veuillez entrer une adresse email valide.");
      setNewsletterData((prev) => ({ ...prev, valid: false }));
      return; // On stoppe l'exécution de la fonction ici
    }

    // --- LE FAUX BACKEND (LocalStorage) --- //

    try {
      // On sauvegarde l'email dans le navigateur de l'utilisateur
      localStorage.setItem("foodmarket_newsletter", emailTrimmed);

      // On met à jour le state pour confirmer que c'est valide
      setNewsletterData({ email: " ", valid: true }); // On vide le champ en passant

      toast.success("Merci ! Vous êtes bien abonné à notre newsletter.");

    } catch (error) {
      toast.error("Erreur lors de l'enregistrement.");
    }
  };
  // 1. Gestion de la saisie
  const handleEmailChange = (e) => {
    // Déstructuration correcte d'un objet
    const { name, value } = e.target;

    // On met à jour proprement via le setter
    setNewsletterData((prevData) => ({
      ...prevData,      // On récupère tout l'ancien objet
      [name]: value,    // On met à jour uniquement le champ modifié (l'email)
      valid: false      // On réinitialise la validité dès que l'utilisateur tape
    }));
  };

  return (
    // On garde la marge de 10 et on enlève les bords arrondis
    <footer className="bg-black rounded-none mt-0 mx-4 md:mx-10 pt-8 sm:pt-12 lg:pt-16 pb-6 sm:pb-8 px-5 sm:px-10 md:px-14 lg:px-20 border-t border-zinc-800">

      <div className="max-w-7xl mx-auto">

        {/* --- GRILLE PRINCIPALE --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8 mb-10 sm:mb-14 lg:mb-16">

          {/* Colonne 1 : Marque & Réseaux Sociaux */}
          <div className="flex flex-col gap-4 sm:gap-6 sm:col-span-2 lg:col-span-1">

            <div className="flex items-center gap-3 text-white">
              <Link to="/" className="flex items-center gap-2">
                <img src={logoImg} className='w-10 sm:w-12' alt="logo" />
                <h2 className='logoText text-xl sm:text-2xl font-bold flex'>F<span className='text-orange-500 font-bold mt-0.5'><Cherry size={22} /></span>d Market</h2>
              </Link>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Vos plats préférés livrés chez vous en un clic. Découvrez le meilleur de la gastronomie locale, chaud et rapidement.
            </p>
            
            {/* Icônes Réseaux Sociaux */}
            <div className="flex gap-4 mt-2">
              <a href="#" className="bg-zinc-900 p-3 rounded-full text-gray-400 hover:bg-[#FF6B00] hover:text-white transition-colors duration-300">
                <Share2 size={20} />
              </a>
              <a href="#" className="bg-zinc-900 p-3 rounded-full text-gray-400 hover:bg-[#FF6B00] hover:text-white transition-colors duration-300">
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Colonne 2 : Liens Rapides */}
          <div>
            <h4 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Liens Rapides</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Accueil</Link></li>
              <li><Link to="/#categories" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Nos Catégories</Link></li>
              <li><Link to="/#ventes" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Meilleures Ventes</Link></li>
              <li><Link to="/#about" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">À propos</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <h4 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Informations</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Devenir Partenaire</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Mentions Légales</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Confidentialité</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">CGV</Link></li>
            </ul>
          </div>

          {/* Colonne 4 : Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-white font-bold text-base sm:text-lg mb-4 sm:mb-6">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Abonnez-vous pour recevoir des codes promo exclusifs et nos nouveautés !
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Votre adresse email"
                name="email"
                id="email"
                value={newsletterData.email}
                onChange={handleEmailChange}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-[#FF6B00] transition-colors w-full text-sm"
              />
              <button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#e66000] text-white font-bold py-3 rounded-xl transition-colors w-full shadow-lg shadow-orange-500/20 text-sm"
              >
                S'abonner
              </button>
            </form>
          </div>

        </div>

        {/* --- BARRE DU BAS (Copyright) --- */}
        <div className="pt-6 sm:pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">
            &copy; {new Date().getFullYear()} Food Market. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs sm:text-sm text-zinc-500 font-medium">
            <span>Fait avec passion 🍕</span>
          </div>
        </div>

      </div>
    </footer>
  );
}