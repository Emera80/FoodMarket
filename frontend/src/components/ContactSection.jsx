

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
    <section className="mx-4 md:mx-10 mt-0 mb-0">
      <motion.div
        className="w-full bg-black rounded-none overflow-hidden flex flex-col lg:flex-row"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >

        {/* --- PANNEAU GAUCHE : Informations --- */}
        <div className="w-full lg:w-2/5 bg-black p-6 sm:p-10 md:p-12 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">Contactez-nous</h2>
            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-10">
              Une question sur une commande ou envie de devenir un restaurant partenaire ? Écrivez-nous !
            </p>

            <div className="flex flex-col gap-5 sm:gap-7">
              <div className="flex items-start gap-3 sm:gap-4 group cursor-pointer">
                <div className="bg-zinc-900 p-3 sm:p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold">Notre Bureau</h4>
                  <p className="text-gray-400 mt-0.5 text-sm">123 Avenue de la Gastronomie,<br />75001 Paris, France</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 group cursor-pointer">
                <div className="bg-zinc-900 p-3 sm:p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold">Téléphone</h4>
                  <p className="text-gray-400 mt-0.5 text-sm">+33 1 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 group cursor-pointer">
                <div className="bg-zinc-900 p-3 sm:p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold">Email</h4>
                  <p className="text-gray-400 mt-0.5 text-sm">hello@foodmarket.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PANNEAU DROIT : Formulaire --- */}
        <div className="w-full lg:w-3/5 p-6 sm:p-10 md:p-12 lg:p-16 bg-white flex flex-col justify-center rounded-none">
          <div className="max-w-4xl">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-6 sm:mb-8">Envoyez-nous un message</h3>
            
            {/* Ajout de onSubmit sur le formulaire */}
            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label htmlFor="nom" className="text-sm font-bold text-zinc-700">Nom complet</label>
                  <input
                    type="text"
                    id="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-sm sm:text-base"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-bold text-zinc-700">Adresse Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean@exemple.com"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="sujet" className="text-sm font-bold text-zinc-700">Sujet</label>
                <input
                  type="text"
                  id="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  placeholder="Problème avec une commande, Partenariat..."
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-bold text-zinc-700">Votre message</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-full resize-none text-sm sm:text-base"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-1 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 group w-full sm:w-auto sm:px-10 self-start text-sm sm:text-base ${isSubmitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-[#FF6B00] hover:bg-[#e66000]'}`}
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