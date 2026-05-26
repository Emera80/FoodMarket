import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { CheckCircle2, Leaf, Clock } from 'lucide-react';

const aboutFeatures = [
  {
    id: 1,
    title: "Des ingrédients frais et locaux",
    description: "Nous collaborons directement avec les producteurs de votre région pour vous garantir des repas préparés avec des produits de saison, sains et pleins de saveurs.",
    icon: <Leaf className="text-white w-6 h-6" />,
    // Nouvelle image qui fonctionne :
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Une livraison ultra-rapide",
    description: "Notre algorithme de livraison optimise chaque trajet. Vos plats quittent les cuisines de nos restaurants partenaires et arrivent chauds chez vous en moins de 30 minutes.",
    icon: <Clock className="text-white w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "La qualité certifiée",
    description: "Chaque restaurant présent sur notre plateforme passe une sélection rigoureuse. Nous lisons tous vos avis pour ne garder que la crème de la crème de la gastronomie.",
    icon: <CheckCircle2 className="text-white w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  }
];

export default function AboutSection() {
  // 1. On crée une référence pour savoir où se trouve cette section sur la page
  const containerRef = useRef(null);

  // 2. On track le scroll par rapport à cette section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"] // L'animation se joue quand le centre de la page traverse la section
  });

  // 3. On ajoute un effet "ressort" (spring) pour que la ligne s'anime de façon fluide et naturelle
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="mt-2 sm:mt-20 mb-0 mx-4 md:mx-10 bg-black rounded-t-2xl sm:rounded-t-[2.5rem] py-12 sm:py-16 lg:py-20 px-5 sm:px-10 md:px-16 lg:px-24 overflow-hidden relative">
      
      {/* En-tête de la section */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 relative z-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500 mb-4 sm:mb-6">À propos de Food Market</h2>
        <p className="text-gray-300 text-sm sm:text-base md:text-lg">
          Plus qu'une simple plateforme de livraison, nous sommes passionnés par la bonne nourriture et les moments partagés.
        </p>
      </div>

      {/* Conteneur principal (avec la ref pour suivre le scroll) */}
      <div ref={containerRef} className="relative flex flex-col gap-14 sm:gap-20 lg:gap-24 max-w-6xl mx-auto py-6 sm:py-10">
        
        {/* --- LA LIGNE DE TEMPS ANIMÉE (Visible uniquement sur PC/Tablette) --- */}
        {/* Ligne de fond (Grise foncée) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-zinc-800 -translate-x-1/2 hidden md:block rounded-full"></div>
        {/* Ligne animée (Orange) qui grandit vers le bas */}
        <motion.div 
          className="absolute left-1/2 top-0 bottom-0 w-1 bg-orange-500 -translate-x-1/2 hidden md:block origin-top rounded-full z-10 shadow-[0_0_15px_rgba(249,115,22,0.8)]"
          style={{ scaleY }} // L'animation magique est ici
        ></motion.div>
        
        {aboutFeatures.map((feature, index) => {
          const isReversed = index % 2 !== 0;

          return (
            <div 
              key={feature.id} 
              className={`relative flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24`}
            >
              
              {/* Le petit point central de la ligne de temps */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-black bg-orange-500 z-20 hidden md:block shadow-lg"></div>

              {/* Moitié 1 : L'image avec le bloc décoratif */}
              <motion.div 
                className="w-full md:w-1/2 relative"
                initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {/* L'image au premier plan (z-10) */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[220px] sm:h-[300px] lg:h-[400px] z-10 border border-zinc-800">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Le fameux bloc Orange solide qui dépasse (z-0 pour être derrière) */}
                {/* Si isReversed, il décale vers la gauche, sinon vers la droite */}
                <div className={`absolute z-0 w-full h-full bg-orange-500 rounded-3xl top-6 ${isReversed ? '-left-6' : '-right-6'}`}></div>
              </motion.div>

              {/* Moitié 2 : Le Texte */}
              <motion.div 
                className="w-full md:w-1/2 flex flex-col gap-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              >
                {/* Icône avec fond orange pour bien ressortir */}
                <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-orange-500/30">
                  {feature.icon}
                </div>
                
                <h3 className="text-3xl font-bold text-orange-500">{feature.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="flex flex-col gap-3 mt-4">
                  <li className="flex items-center gap-3 text-white font-medium">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    Qualité supérieure
                  </li>
                  <li className="flex items-center gap-3 text-white font-medium">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    Service client 24/7
                  </li>
                </ul>
              </motion.div>

            </div>
          );
        })}

      </div>
    </section>
  );
}