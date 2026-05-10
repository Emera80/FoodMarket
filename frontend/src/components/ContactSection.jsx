// import React from 'react';
// import { motion } from 'framer-motion';
// import { MapPin, Phone, Mail, Send } from 'lucide-react';

// export default function ContactSection() {
//   return (
//     // mx-[20px] force exactement 20px de marge à gauche et à droite sur le navigateur
//     <section className=" mx-[20px]">
      
//       {/* Conteneur principal étendu : on a retiré max-w-6xl et ajouté w-full */}
//       <motion.div 
//         className="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100"
//         initial={{ opacity: 0, y: 50 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, margin: "-100px" }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//       >
        
//         {/* --- PANNEAU GAUCHE : Informations --- */}
//         {/* Sur un très grand écran, la répartition 2/5 (gauche) et 3/5 (droite) fonctionne toujours très bien */}
//         <div className="w-full lg:w-2/5 bg-black p-10 md:p-16 text-white relative overflow-hidden flex flex-col justify-between">
          
//           <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl"></div>

//           <div className="relative z-10">
//             <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Contactez-nous</h2>
//             <p className="text-gray-400 text-lg mb-12">
//               Une question sur une commande ou envie de devenir un restaurant partenaire ? Écrivez-nous !
//             </p>

//             <div className="flex flex-col gap-8">
//               <div className="flex items-start gap-4 group cursor-pointer">
//                 <div className="bg-zinc-900 p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
//                   <MapPin size={28} />
//                 </div>
//                 <div>
//                   <h4 className="text-xl font-bold">Notre Bureau</h4>
//                   <p className="text-gray-400 mt-1">123 Avenue de la Gastronomie,<br />75001 Paris, France</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4 group cursor-pointer">
//                 <div className="bg-zinc-900 p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
//                   <Phone size={28} />
//                 </div>
//                 <div>
//                   <h4 className="text-xl font-bold">Téléphone</h4>
//                   <p className="text-gray-400 mt-1">+33 1 23 45 67 89</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4 group cursor-pointer">
//                 <div className="bg-zinc-900 p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
//                   <Mail size={28} />
//                 </div>
//                 <div>
//                   <h4 className="text-xl font-bold">Email</h4>
//                   <p className="text-gray-400 mt-1">hello@foodmarket.com</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* --- PANNEAU DROIT : Formulaire --- */}
//         <div className="w-full lg:w-3/5 p-10 md:p-16 lg:p-20 bg-white flex flex-col justify-center">
          
//           <div className="max-w-4xl"> {/* Petit wrapper interne pour éviter que les inputs ne soient trop longs sur un écran géant */}
//             <h3 className="text-3xl lg:text-4xl font-bold text-black mb-10">Envoyez-nous un message</h3>
            
//             <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
              
//               <div className="flex flex-col md:flex-row gap-8">
//                 <div className="flex-1 flex flex-col gap-3">
//                   <label htmlFor="name" className="text-sm font-bold text-zinc-700">Nom complet</label>
//                   <input 
//                     type="text" 
//                     id="name" 
//                     placeholder="Jean Dupont" 
//                     className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-lg"
//                   />
//                 </div>
                
//                 <div className="flex-1 flex flex-col gap-3">
//                   <label htmlFor="email" className="text-sm font-bold text-zinc-700">Adresse Email</label>
//                   <input 
//                     type="email" 
//                     id="email" 
//                     placeholder="jean@exemple.com" 
//                     className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-lg"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col gap-3">
//                 <label htmlFor="subject" className="text-sm font-bold text-zinc-700">Sujet</label>
//                 <input 
//                   type="text" 
//                   id="subject" 
//                   placeholder="Problème avec une commande, Partenariat..." 
//                   className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-lg"
//                 />
//               </div>

//               <div className="flex flex-col gap-3">
//                 <label htmlFor="message" className="text-sm font-bold text-zinc-700">Votre message</label>
//                 <textarea 
//                   id="message" 
//                   rows="5" 
//                   placeholder="Comment pouvons-nous vous aider ?" 
//                   className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full resize-none text-lg"
//                 ></textarea>
//               </div>

//               <button 
//                 type="submit" 
//                 className="mt-2 bg-[#FF6B00] hover:bg-[#e66000] text-white font-bold py-4 rounded-xl transition-colors duration-300 flex justify-center items-center gap-2 group w-full md:w-auto md:px-12 self-start text-lg"
//               >
//                 Envoyer le message
//                 <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
//               </button>

//             </form>
//           </div>

//         </div>

//       </motion.div>
//     </section>
//   );
// }

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ContactSection() {
  // 1. Déclaration des états pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Gestion de la saisie utilisateur
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  // 3. Soumission du formulaire au Backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Petite validation frontend
    if (!formData.nom || !formData.email || !formData.sujet || !formData.message) {
      return toast.error("Veuillez remplir tous les champs.");
    }

    setIsSubmitting(true);

    try {
      // Envoi de la requête POST vers l'API Django
      await api.post('/catalog/contact/', formData);
      
      toast.success("Votre message a été envoyé avec succès !");
      
      // On vide le formulaire après succès
      setFormData({ nom: '', email: '', sujet: '', message: '' });
    } catch (error) {
      console.error("Erreur d'envoi:", error);
      toast.error("Une erreur est survenue lors de l'envoi du message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-[20px]">
      <motion.div 
        className="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        
        {/* --- PANNEAU GAUCHE : Informations --- */}
        <div className="w-full lg:w-2/5 bg-black p-10 md:p-16 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Contactez-nous</h2>
            <p className="text-gray-400 text-lg mb-12">
              Une question sur une commande ou envie de devenir un restaurant partenaire ? Écrivez-nous !
            </p>

            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-zinc-900 p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Notre Bureau</h4>
                  <p className="text-gray-400 mt-1">123 Avenue de la Gastronomie,<br />75001 Paris, France</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-zinc-900 p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Téléphone</h4>
                  <p className="text-gray-400 mt-1">+33 1 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-zinc-900 p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <Mail size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Email</h4>
                  <p className="text-gray-400 mt-1">hello@foodmarket.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PANNEAU DROIT : Formulaire --- */}
        <div className="w-full lg:w-3/5 p-10 md:p-16 lg:p-20 bg-white flex flex-col justify-center">
          <div className="max-w-4xl">
            <h3 className="text-3xl lg:text-4xl font-bold text-black mb-10">Envoyez-nous un message</h3>
            
            {/* Ajout de onSubmit sur le formulaire */}
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex flex-col gap-3">
                  <label htmlFor="nom" className="text-sm font-bold text-zinc-700">Nom complet</label>
                  <input 
                    type="text" 
                    id="nom" // Correspond à l'ID dans le state
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Jean Dupont" 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-lg"
                  />
                </div>
                
                <div className="flex-1 flex flex-col gap-3">
                  <label htmlFor="email" className="text-sm font-bold text-zinc-700">Adresse Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean@exemple.com" 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-lg"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="sujet" className="text-sm font-bold text-zinc-700">Sujet</label>
                <input 
                  type="text" 
                  id="sujet" 
                  value={formData.sujet}
                  onChange={handleChange}
                  placeholder="Problème avec une commande, Partenariat..." 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-lg"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="message" className="text-sm font-bold text-zinc-700">Votre message</label>
                <textarea 
                  id="message" 
                  value={formData.message}
                  onChange={handleChange}
                  rows="5" 
                  placeholder="Comment pouvons-nous vous aider ?" 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full resize-none text-lg"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} // Désactive le bouton pendant l'envoi
                className={`mt-2 text-white font-bold py-4 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 group w-full md:w-auto md:px-12 self-start text-lg ${isSubmitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-[#FF6B00] hover:bg-[#e66000]'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={22} /> Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer le message
                    <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}