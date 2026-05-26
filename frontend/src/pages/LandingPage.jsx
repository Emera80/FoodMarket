
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

              <section className='heroSection mt-10 md:mt-15'>
                  <div className='heroContent mx-4 md:mx-10 flex items-center rounded-3xl bg-black text-white min-h-[500px] md:h-[700px] relative overflow-hidden'>

                    {/* Image de fond sur mobile, positionnée à droite sur desktop */}
                    <div className='HeroContentImage absolute inset-0 md:inset-auto md:right-0 md:top-0 md:w-1/2 md:h-full'>
                      <div className="absolute inset-y-0 left-0 w-full md:w-48 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                      <div className="absolute inset-0 bg-black/50 md:hidden z-0"></div>
                      <img
                        src={HeroImg}
                        alt="Hero Image"
                        className='w-full h-full object-cover'
                      />
                    </div>

                    {/* Texte */}
                    <div className='HeroContentText relative flex flex-col gap-5 md:gap-7 w-full md:w-1/2 px-6 md:px-10 z-10 py-10 md:py-0 md:mt-5'>
                      <div>
                        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-5'>Vos plats préférés, <br />livrés chez vous</h1>
                      </div>
                      <div>
                        <p className='text-base md:text-lg mb-3 md:mb-5 text-zinc-300'>Découvrez une variété de plats délicieux de vos restaurants préférés à livrer chez vous en quelques clics.</p>
                      </div>
                      <div className='bg-orange-500 text-white px-6 py-4 rounded-[15px] text-base md:text-xl font-bold hover:bg-orange-600 w-full sm:w-[350px] flex gap-2 items-center justify-center cursor-pointer hover:translate-x-2 transition-transform duration-300'>
                        <Link to="/checkout">Commander maintenant</Link>
                        <span><ArrowRight /></span>
                      </div>

                      {/* Preuve sociale */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Client 1" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black object-cover relative z-30" />
                          <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Client 2" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black object-cover -ml-3 md:-ml-4 relative z-20" />
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Client 3" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black object-cover -ml-3 md:-ml-4 relative z-10" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-white font-bold text-base md:text-lg leading-none mb-1.5">100k+ Rating</span>
                          <div className="flex items-center gap-1 text-orange-500">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <svg key={index} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="hidden sm:flex items-center gap-5 md:gap-7 pt-6 border-t border-zinc-800/80">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500/10 p-2.5 rounded-full text-[#FF6B00]"><Truck size={18} /></div>
                          <span className="text-zinc-300 text-sm font-medium leading-tight">Livraison <br/>Rapide</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500/10 p-2.5 rounded-full text-[#FF6B00]"><Star size={18} /></div>
                          <span className="text-zinc-300 text-sm font-medium leading-tight">Top <br/>Restaurants</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500/10 p-2.5 rounded-full text-[#FF6B00]"><ShieldCheck size={18} /></div>
                          <span className="text-zinc-300 text-sm font-medium leading-tight">Paiement <br/>Sécurisé</span>
                        </div>
                      </div>
                    </div>

                  </div>
            </section>
            {/* Section Categories */}
            <section id='categories' className='categoriesSection bg-gray-50/50 py-10'>
              <div className='mx-4 md:mx-10 my-10 md:my-20'>
                    <div className='titreCategories mb-10'>
                        <div>
                          <h2 className='text-3xl md:text-5xl font-bold text-black text-center mb-3'>Catégories Populaires</h2>
                          <p className='text-gray-500 mt-2 text-center text-base md:text-lg'>Découvrez nos meilleures sélections pour vous</p>
                        </div>
                    </div>
                    
                    <div className='categoriesList flex items-stretch lg:justify-center gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide px-1'>
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
                            className='categoryItem flex flex-col items-center justify-between p-4 md:p-6 cursor-pointer min-w-[140px] md:min-w-[200px] h-[220px] md:h-[300px] shrink-0 group transition-all duration-500 bg-white rounded-2xl md:rounded-3xl shadow-sm hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/20 border border-gray-100'
                          >
                              <div className={`${cat.color} p-4 md:p-6 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform duration-500 flex justify-center items-center aspect-square w-20 md:w-32 shadow-inner`}>
                                  <img src={cat.img} alt={cat.name} className='w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-md' />
                              </div>
                              <span className='font-bold text-gray-800 text-base md:text-xl group-hover:text-orange-500 transition-colors'>{cat.name}</span>
                          </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* //Meilleurs ventes/Plats section */}
            <section id='ventes'>
                <div>
                    <div>
                        <h2 className='text-3xl md:text-5xl font-bold text-black text-center mb-3'>Meilleurs Ventes</h2>
                        <p className='text-gray-500 mt-2 text-center text-base md:text-lg'>Les plats les plus commandés près de chez vous.</p>
                    </div>
                    <div className='mx-4 md:mx-10 my-10 md:my-15'>
                        <VentesPlats />
                    </div>
                </div>
            </section>
            {/* Section À propos */}
            <div id='about'>
                <AboutSection />
            </div>
            {/* Section Contact */}
            <div id='contact'>
                <ContactSection />
            </div>
            {/* Footer */}
            <Footer />
              
        </div>
    );
};

export default LandingPage;
