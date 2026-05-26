import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import {
	ArrowLeft, Heart, Star, MapPin, Clock, Info, 
    MessageSquare, Utensils, Phone, Send, User
} from "lucide-react";
import toast from "react-hot-toast";

export default function RestaurantDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { addToCart } = useCart();
	const [restaurant, setRestaurant] = useState(null);
	const [plats, setPlats] = useState([]);
	const [loading, setLoading] = useState(true);

	const [activeTab, setActiveTab] = useState("Menu");
	const [activeCategory, setActiveCategory] = useState("Tous");

    // Nouveaux états pour le formulaire d'avis
    const [newReview, setNewReview] = useState({ note: 5, commentaire: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isAuthenticated = !!localStorage.getItem("access_token");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [resRest, resPlat] = await Promise.all([
					api.get(`/catalog/restaurants/${id}/`),
					api.get("/catalog/plats/"),
				]);
				setRestaurant(resRest.data);
				const allPlats = resPlat.data.results || resPlat.data;
				setPlats(allPlats.filter((p) => p.restaurant === parseInt(id)));
				setLoading(false);
			} catch (err) {
				console.error("Erreur de chargement", err);
				setLoading(false);
			}
		};
		fetchData();
	}, [id]);

    // Fonction pour soumettre un avis
    const submitReview = async (e) => {
        e.preventDefault();
        if (!newReview.commentaire.trim()) return toast.error("Le commentaire ne peut pas être vide.");
        
        setIsSubmitting(true);
        try {
            const response = await api.post(
                `/catalog/restaurants/${id}/ajouter_avis/`, 
                newReview
            );
            
            toast.success("Votre avis a été publié !");
            // Mettre à jour la liste des avis localement pour un affichage immédiat
            setRestaurant(prev => ({
                ...prev,
                avis: [response.data, ...(prev.avis || [])]
            }));
            setNewReview({ note: 5, commentaire: "" }); // Reset du formulaire
        } catch (error) {
            toast.error("Erreur lors de la publication de l'avis.");
        } finally {
            setIsSubmitting(false);
        }
    };

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center font-bold text-orange-600">
				Chargement du menu...
			</div>
		);
	if (!restaurant)
		return (
			<div className="text-center py-20 text-gray-500">
				Restaurant introuvable.
			</div>
		);

	const categories = ["Tous", ...new Set(plats.map((p) => p.categorie))];
	const filteredPlats =
		activeCategory === "Tous"
			? plats
			: plats.filter((p) => p.categorie === activeCategory);

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
					{/* 1. BANNIÈRE (HERO IMAGE) */}
			<div className="relative h-72 md:h-96 w-full overflow-hidden">
				<img src={restaurant.image} alt="Bannière" className="w-full h-full object-cover" />
				<div className="absolute inset-0 bg-black/20"></div>
				<div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30 max-w-6xl mx-auto">
					<button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-800 shadow-lg hover:bg-gray-50 transition-all">
						<ArrowLeft size={18} /> Retour
					</button>
					<button className="bg-white p-3 rounded-xl shadow-lg text-gray-400 hover:text-red-500 transition-colors">
						<Heart size={22} />
					</button>
				</div>
			</div>

			{/* 2. CARTE D'INFORMATION (OVERLAP) */}
			<div className="relative -mt-20 z-40 max-w-6xl mx-auto px-4">
				<div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-4 md:p-8">
					<div className="flex flex-col md:flex-row gap-8 items-start relative">
						{/* Logo circulaire */}
						<div className="w-28 h-28 rounded-full border-[6px] border-white shadow-lg overflow-hidden shrink-0 bg-gray-100 -mt-20 md:-mt-24">
							<img src={restaurant.image} alt="Logo" className="w-full h-full object-cover" />
						</div>

						<div className="flex-1">
							<div className="flex justify-between items-start">
								<div>
									<h1 className="text-3xl font-black text-gray-900 mb-2">{restaurant.nom}</h1>
									<p className="text-gray-500 font-bold text-sm tracking-wide uppercase mb-4">{restaurant.type_cuisine}</p>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-sm font-bold text-gray-700">
								<div className="flex items-center">
									<Star className="text-orange-500 mr-2" size={20} fill="currentColor" />
									<span className="text-gray-900 text-lg">{restaurant.note_moyenne || 0}</span>
									<span className="text-gray-400 ml-1 font-medium">({restaurant.avis?.length || 0} avis)</span>
									<span className="mx-2 text-gray-300">•</span>
									<span>{restaurant.temps_livraison_estime} min</span>
								</div>
								<div className="flex items-center text-gray-500">
									<MapPin className="mr-2 text-gray-400" size={18} />
									{restaurant.adresse}
								</div>
								<div className="flex items-center">
									<span className={`w-2.5 h-2.5 rounded-full mr-2 ${restaurant.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
									<span className={restaurant.is_active ? "text-green-600" : "text-red-600"}>
										{restaurant.is_active ? "Ouvert" : "Fermé"}
									</span>
									<span className="ml-2 text-gray-400 font-medium">- {restaurant.horaires}</span>
								</div>
							</div>
						</div>
					</div>

					{/* ONGLETS */}
					<div className="flex border-b border-gray-100 mt-10 gap-6 md:gap-12 overflow-x-auto scrollbar-hide">
						{[
							{ id: "Menu", icon: <Utensils size={18} /> },
							{ id: "Avis", icon: <MessageSquare size={18} /> },
							{ id: "Infos", icon: <Info size={18} /> },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`pb-4 flex items-center gap-2 font-black text-sm transition-all relative ${
									activeTab === tab.id ? "text-green-700" : "text-gray-400 hover:text-gray-600"
								}`}>
								{tab.icon} {tab.id}
								{activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-t-full"></div>}
							</button>
						))}
					</div>
				</div>

				{/* 3. CONTENU DES ONGLETS */}
				<div className="mt-8">
					{/* ================= ONGLET : MENU ================= */}
					{activeTab === "Menu" && (
						<div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-4 md:p-8 animate-fadeIn">
							<div className="flex gap-3 overflow-x-auto pb-6 mb-8 scrollbar-hide">
								{categories.map((cat) => (
									<button key={cat} onClick={() => setActiveCategory(cat)}
										className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
											activeCategory === cat ? "bg-green-600 text-white shadow-lg" : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
										}`}>
										{cat}
									</button>
								))}
							</div>

							<div className="space-y-6">
								{filteredPlats.map((plat) => (
									<div key={plat.id} className="flex items-start sm:items-center gap-4 group border-b border-gray-50 pb-6 last:border-0">
										<div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-gray-50 overflow-hidden shrink-0 shadow-sm border border-gray-100">
											<img src={plat.image} alt={plat.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="text-base sm:text-xl font-black text-gray-900 mb-1">{plat.nom}</h3>
											<p className="text-gray-500 text-sm line-clamp-2 font-medium mb-3">{plat.description}</p>
											<div className="flex items-center justify-between gap-4">
												<span className="text-lg sm:text-xl font-black text-gray-900 whitespace-nowrap">{parseFloat(plat.prix).toFixed(3)} DT</span>
												<button onClick={() => addToCart(plat)} className="px-4 sm:px-8 py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition-all active:scale-95 text-sm sm:text-base whitespace-nowrap">
													Ajouter
												</button>
											</div>
										</div>
									</div>
								))}
								{filteredPlats.length === 0 && (
									<div className="text-center py-10">
										<Utensils className="mx-auto text-gray-200 mb-4" size={48} />
										<p className="text-gray-400 font-bold">Aucun plat disponible pour le moment.</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* ================= ONGLET : AVIS ================= */}
					{activeTab === "Avis" && (
						<div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-4 md:p-8 animate-fadeIn space-y-10">
                            
                            {/* FORMULAIRE D'AJOUT D'AVIS */}
                            <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                                <h3 className="text-lg font-black text-gray-900 mb-4">Laissez votre avis</h3>
                                {!isAuthenticated ? (
                                    <p className="text-sm font-bold text-gray-500">Vous devez être connecté pour laisser un avis sur ce restaurant.</p>
                                ) : (
                                    <form onSubmit={submitReview} className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-700 mr-2">Votre note :</span>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button type="button" key={star} onClick={() => setNewReview({...newReview, note: star})} className="focus:outline-none transition-transform hover:scale-110">
                                                    <Star size={24} className={newReview.note >= star ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <textarea 
                                                value={newReview.commentaire}
                                                onChange={(e) => setNewReview({...newReview, commentaire: e.target.value})}
                                                placeholder="Partagez votre expérience..." 
                                                className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24"
                                            ></textarea>
                                            <button disabled={isSubmitting} type="submit" className="bg-gray-900 hover:bg-black text-white px-6 py-4 sm:py-0 rounded-2xl font-bold flex flex-row sm:flex-col items-center justify-center gap-2 transition-colors w-full sm:w-32 disabled:opacity-50">
                                                <Send size={20} />
                                                <span className="text-xs uppercase tracking-widest">{isSubmitting ? "Envoi..." : "Publier"}</span>
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* LISTE DES AVIS */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4">Avis des clients ({restaurant.avis?.length || 0})</h3>
                                {restaurant.avis && restaurant.avis.length > 0 ? (
                                    restaurant.avis.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                                                {item.user_avatar ? (
                                                    <img src={item.user_avatar} alt={item.user_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-bold text-gray-900">{item.user_name || "Client"}</h4>
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < item.note ? "currentColor" : "none"} stroke={i < item.note ? "currentColor" : "#d1d5db"} />
                                                    ))}
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed pt-2">"{item.commentaire}"</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
                                        <p className="text-gray-400 font-bold">Aucun avis pour le moment. Soyez le premier !</p>
                                    </div>
                                )}
                            </div>
						</div>
					)}

					{/* ================= ONGLET : INFOS ================= */}
					{activeTab === "Infos" && (
						<div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-4 md:p-8 animate-fadeIn">
                            <h3 className="text-xl font-black text-gray-900 mb-6">À propos de {restaurant.nom}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Info size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-1">Description</h4>
                                            <p className="text-gray-600 font-medium text-sm leading-relaxed">{restaurant.description || "Aucune description disponible pour ce restaurant."}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Utensils size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-1">Spécialité</h4>
                                            <p className="text-gray-600 font-bold text-sm bg-gray-100 inline-block px-3 py-1 rounded-lg mt-1">{restaurant.type_cuisine}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><MapPin size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-1">Adresse</h4>
                                            <p className="text-gray-600 font-bold text-sm">{restaurant.adresse}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Clock size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-1">Horaires</h4>
                                            <p className="text-gray-600 font-bold text-sm">{restaurant.horaires || "Non renseignés"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Phone size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-1">Contact</h4>
                                            <p className="text-gray-600 font-bold text-sm">{restaurant.telephone || "Non renseigné"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}