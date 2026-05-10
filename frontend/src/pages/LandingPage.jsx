
import React, { useEffect } from 'react'; // Ajoute useEffect
import { Link, useLocation } from 'react-router-dom'; // Ajoute useLocation
import  '../index.css';
import { 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  MapPin,
  ArrowRight,
  Truck, Star,
} from 'lucide-react';

// Import des images des catégories
import pizzaImg from '../assets/foodCategoriesImg/pizza.png';
import burgerImg from '../assets/foodCategoriesImg/burger.png';
import dessertImg from '../assets/foodCategoriesImg/dessert.png';
import boissonImg from '../assets/foodCategoriesImg/boisson.png';
import saladImg from '../assets/foodCategoriesImg/salad.png';
import africanImg from '../assets/foodCategoriesImg/african_food.png';
import asianImg from '../assets/foodCategoriesImg/asiatique_food.png';
import RamenImg from '../assets/foodCategoriesImg/ramen.png';
import HeroImg from '../assets/foodCategoriesImg/heroImg.webp';

import VentesPlats from '../components/VentesPlats';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';


const LandingPage = () => {
  const location = useLocation();

  // CE BLOC GÈRE LE DÉFILEMENT FLUIDE (SMOOTH SCROLL)
    useEffect(() => {
        if (location.hash) {
            // Si l'URL contient un # (ex: /#about), on cherche l'élément et on défile vers lui
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100); // Petit délai pour laisser la page charger
            }
        } else {
            // Si pas de #, on remonte tout en haut
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    }, [location]);
    return (
        <div>
              {/* /// --- SECTION HÉRO --- /// */}

              <section className='heroSection mt-15'>
                  {/* 1. Le conteneur parent doit être "relative" et "overflow-hidden" pour que l'image ne dépasse pas des bords arrondis */}
                  <div className='heroContent mx-10 flex items-center rounded-3xl bg-black text-white h-[700px] relative overflow-hidden'>
                    
                    {/* 2. La partie Texte : On lui donne 50% de largeur (w-1/2) et on la met au premier plan (z-10) */}
                    <div className='HeroContentText flex flex-col gap-7 w-1/2 px-10 z-10 mt-5'>
                      <div>
                        <h1 className='text-5xl font-bold mb-5'>Vos plats préférés, <br />livrés chez vous</h1>
                      </div>
                      <div>
                        <p className='text-lg mb-5'>Découvrez une variété de plats délicieux de vos <br /> restaurants préférés à livrer chez vous en quelques clics.</p>
                      </div>
                       {/* faire bouger la flèche à droite du bouton "Commander maintenant" pour indiquer que c'est cliquable  */}
                      <div className='bg-orange-500 text-white px-6 py-4 rounded-[15px] text-xl font-bold hover:bg-orange-600  w-[350px] flex gap-2 items-center justify-center cursor-pointer hover:translate-x-2 transition-transform duration-300 ' >
                        <Link to="/checkout" >
                          Commander maintenant 
                        </Link>
                          <span><ArrowRight /></span>
                      </div>
                      {/* --- LE BLOC PREUVE SOCIALE INTÉGRÉ ICI --- */}
                      <div className="flex items-center gap-4 mt-2">
                        {/* Les 3 avatars superposés */}
                        <div className="flex">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                            alt="Client 1" 
                            className="w-12 h-12 rounded-full border-2 border-black object-cover relative z-30"
                          />
                          <img 
                            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                            alt="Client 2" 
                            className="w-12 h-12 rounded-full border-2 border-black object-cover -ml-4 relative z-20"
                          />
                          <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                            alt="Client 3" 
                            className="w-12 h-12 rounded-full border-2 border-black object-cover -ml-4 relative z-10"
                          />
                        </div>

                        {/* Le texte 100k+ et les étoiles */}
                        <div className="flex flex-col justify-center">
                          <span className="text-white font-bold text-lg leading-none mb-1.5">
                            100k+ Rating
                          </span>
                          <div className="flex items-center gap-1 text-orange-500">
                            {/* Génération de 5 étoiles SVG directement intégrées */}
                            {Array.from({ length: 5 }).map((_, index) => (
                              <svg key={index} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* --- FIN DU BLOC PREUVE SOCIALE --- */}
                      <div className="flex flex-wrap items-center gap-8 mt-2 pt-8 border-t border-zinc-800/80"></div>
                      <div className='flex items-center gap-7 '>
                        <div className="flex items-center gap-3">
                        <div className="bg-orange-500/10 p-2.5 rounded-full text-[#FF6B00]">
                          <Truck size={20} />
                        </div>
                        <span className="text-zinc-300 text-sm font-medium leading-tight">Livraison <br/>Rapide</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500/10 p-2.5 rounded-full text-[#FF6B00]">
                          <Star size={20} />
                        </div>
                        <span className="text-zinc-300 text-sm font-medium leading-tight">Top <br/>Restaurants</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500/10 p-2.5 rounded-full text-[#FF6B00]">
                          <ShieldCheck size={20} />
                        </div>
                        <span className="text-zinc-300 text-sm font-medium leading-tight">Paiement <br/>Sécurisé</span>
                      </div>
                    </div>
                      </div>

                    {/* 3. La partie Image : Fixée à droite, prenant 50% de largeur et 100% de la hauteur */}
                    <div className='HeroContentImage absolute right-0 top-0 w-1/2 h-full'>
                      
                      {/* 🪄 LE SECRET EST ICI : Le masque de dégradé */}
                      {/* Il se place à gauche de l'image (left-0), prend toute la hauteur (inset-y-0) et fait un fondu du noir vers le transparent */}
                      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black to-transparent z-10"></div>
                      
                      {/* L'image elle-même, qui remplit tout l'espace */}
                      <img 
                        src={HeroImg} 
                        alt="Hero Image" 
                        className='w-full h-full object-cover' 
                      />
                    </div>
                    
                  </div>
            </section>
            {/* Section Categories */}
            <section id='categories' className='categoriesSection bg-gray-50/50 py-10'>
              <div className='mx-10 my-20'>
                    <div className='titreCategories mb-10 '>
                        <div>
                          <h2 className='text-5xl font-bold text-black text-center mb-3 '>Catégories Populaires</h2>
                          <p className='text-gray-500 mt-2 text-center text-lg'>Découvrez nos meilleures sélections pour vous</p>
                        </div>
                    </div>
                    
                    <div className='categoriesList flex items-center justify-center gap-6 overflow-x-auto pb-8 scrollbar-hide px-4'>
                        {[
                          { name: 'Pizza', img: pizzaImg, color: 'bg-red-50' },
                          { name: 'Burger', img: burgerImg, color: 'bg-orange-50' },
                          { name: 'Salade', img: saladImg, color: 'bg-green-50' },
                          { name: 'Dessert', img: dessertImg, color: 'bg-pink-50' },
                          { name: 'Boisson', img: boissonImg, color: 'bg-blue-50' },
                          { name: 'Africain', img: africanImg, color: 'bg-yellow-50' },
                          { name: 'Asiatique', img: asianImg, color: 'bg-purple-50' },
                        ].map((cat, index) => (
                          <div 
                            key={index}
                            className='categoryItem flex flex-col items-center justify-between p-6 cursor-pointer min-w-[200px] h-[300px] group transition-all duration-500 bg-white rounded-3xl shadow-sm hover:-translate-y-3 hover:shadow-2xl hover:shadow-orange-500/20 border border-gray-100'
                          >
                              <div className={`${cat.color} p-6 rounded-2xl group-hover:scale-110 transition-transform duration-500 flex justify-center items-center aspect-square w-32 shadow-inner`}>
                                  <img src={cat.img} alt={cat.name} className='w-20 h-20 object-contain drop-shadow-md' />
                              </div>
                              <span className='font-bold text-gray-800 text-xl group-hover:text-orange-500 transition-colors'>{cat.name}</span>
                          </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* //Meilleurs ventes/Plats section */}
            <section id='ventes'>
                <div>
                    <div>
                        <h2 className='text-5xl font-bold text-black text-center mb-3 '>Meilleurs Ventes</h2>
                        <p className='text-gray-500 mt-2 text-center text-lg'>Les plats les plus commandés près de chez vous.</p>
                    </div>
                    <div className='mx-10 my-15'>
                        <VentesPlats />
                    </div>
                </div>
            </section>
            {/* Section À propos */}
            <div id='about'>
                <AboutSection id='about'/>
            </div>
            <div id='plats'>
                {/* On peut imaginer que Plats est une section spécifique ou incluse dans les ventes/about */}
            </div>
            {/* Section Contact */}
            <div id='contact'>
                <ContactSection id='contact'/>
            </div>
            {/* Footer */}
            <Footer />
              
        </div>
    );
};

export default LandingPage;
