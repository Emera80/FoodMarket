
import React from 'react';
import { Share2, Globe, Utensils, Cherry } from 'lucide-react';
import logoImg from '../assets/foodCategoriesImg/logo.png';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    // On garde la marge de 20px et on arrondit seulement le haut (rounded-t-[2.5rem])
    <footer className="bg-black rounded-t-[2.5rem] mt-20 mx-[20px] pt-16 pb-8 px-10 md:px-16 lg:px-20">
      
      {/* Conteneur pour limiter la largeur du contenu à l'intérieur du grand fond noir */}
      <div className="max-w-7xl mx-auto">
        
        {/* --- GRILLE PRINCIPALE (4 Colonnes) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Colonne 1 : Marque & Réseaux Sociaux */}
          <div className="flex flex-col gap-6">
            
            {/* Faux Logo avec l'icône Utensils */}
            <div className="flex items-center gap-3 text-white">
              <Link to="/" className="flex items-center gap-3">
                <div >
                  <img src={logoImg} className='w-16' alt="logo" />
                </div>
                <h2 className='logoText text-3xl font-bold flex'>F<span className='text-orange-500 font-bold mt-1 '><Cherry size={30} /></span>d Market</h2>
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
            <h4 className="text-white font-bold text-lg mb-6">Liens Rapides</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Accueil</Link></li>
              <li><Link to="/#categories" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Nos Catégories</Link></li>
              <li><Link to="/#ventes" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Meilleures Ventes</Link></li>
              <li><Link to="/#about" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">À propos</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Informations</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Devenir Partenaire</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Mentions Légales</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">Confidentialité</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-[#FF6B00] transition-colors font-medium">CGV</Link></li>
            </ul>
          </div>

          {/* Colonne 4 : Newsletter */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Abonnez-vous pour recevoir des codes promo exclusifs et nos nouveautés !
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Votre adresse email"
                // Champ adapté au Dark Mode : fond sombre, bordure discrète
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-[#FF6B00] transition-colors w-full"
              />
              <button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#e66000] text-white font-bold py-3 rounded-xl transition-colors w-full shadow-lg shadow-orange-500/20"
              >
                S'abonner
              </button>
            </form>
          </div>

        </div>

        {/* --- BARRE DU BAS (Copyright) --- */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} Food Market. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500 font-medium">
            <span>Fait avec passion 🍕</span>
          </div>
        </div>

      </div>
    </footer>
  );
}