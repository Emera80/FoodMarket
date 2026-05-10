import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Camera, Coins, Tag, Utensils, ArrowLeft, X } from "lucide-react"; // Ajout de ArrowLeft et X
import toast from "react-hot-toast"; // Import des notifications

export default function CreatePlatPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [restaurants, setRestaurants] = useState([]);

	const [formData, setFormData] = useState({
		restaurant: "",
		nom: "",
		categorie: "",
		description: "",
		prix: "",
		image: "",
		is_available: true,
	});

	useEffect(() => {
		api
			.get("/catalog/restaurants/")
			.then((response) => {
				const data = response.data.results || response.data;
				setRestaurants(data);
				if (data.length > 0) {
					setFormData((prev) => ({ ...prev, restaurant: data[0].id }));
				}
			})
			.catch((err) => console.error("Erreur chargement restaurants", err));
	}, []);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === "is_available") {
			setFormData({ ...formData, [name]: value === "true" });
		} else {
			setFormData({
				...formData,
				[name]: type === "checkbox" ? checked : value,
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		
		try {
			await api.post("/catalog/plats/", formData);
			
			// Notification stylée
			toast.success(`${formData.nom} a été ajouté au menu !`);
			
			// REDIRECTION VERS LA GESTION DES PLATS
			navigate("/admin/menu"); 
		} catch (err) {
			console.error(err);
			const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Erreur lors de la création";
			toast.error("Échec de l'ajout : " + errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6 md:p-10">
			<div className="w-full max-w-[1600px] mx-auto">
				
				{/* HEADER AVEC BOUTON RETOUR */}
				<div className="mb-8 flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-black text-gray-900">
							Ajouter un Plat
						</h1>
						<p className="text-gray-500 mt-2 font-medium">
							Enrichissez le menu de vos restaurants partenaires
						</p>
					</div>
					
					{/* BOUTON RETOUR / ANNULER */}
					<button 
						onClick={() => navigate("/admin/menu")}
						className="flex items-center gap-2 px-5 py-3 bg-white text-gray-600 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
					>
						<ArrowLeft size={18} />
						Retour à la gestion
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
						
						{/* COLONNE 1 : INFOS */}
						<div className="lg:col-span-5 space-y-6">
							<div>
								<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
									Restaurant associé
								</label>
								<div className="relative">
									<select
										name="restaurant"
										required
										value={formData.restaurant}
										onChange={handleChange}
										className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12 appearance-none cursor-pointer font-bold">
										<option value="" disabled>Choisir un restaurant...</option>
										{restaurants.map((rest) => (
											<option key={rest.id} value={rest.id}>{rest.nom}</option>
										))}
									</select>
									<Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								</div>
							</div>

							<div>
								<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom du plat</label>
								<input type="text" name="nom" required value={formData.nom} onChange={handleChange}
									className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold" />
							</div>

							<div>
								<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Catégorie</label>
								<div className="relative">
									<input type="text" name="categorie" list="categories-plats" required placeholder="Entrée, Plat, Dessert..." value={formData.categorie} onChange={handleChange}
										className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12 font-bold" />
									<Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<datalist id="categories-plats">
										<option value="Entrée" /><option value="Plat principal" /><option value="Dessert" /><option value="Boisson" /><option value="Accompagnement" />
									</datalist>
								</div>
							</div>

							<div>
								<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description / Ingrédients</label>
								<textarea name="description" rows="4" value={formData.description} onChange={handleChange}
									className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold"></textarea>
							</div>
						</div>

						{/* COLONNE 2 : IMAGE */}
						<div className="lg:col-span-3 flex flex-col pt-1">
							<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 text-center lg:text-left">Photo du plat</label>
							<div className="w-full aspect-square bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative mb-4">
								{formData.image ? (
									<img src={formData.image} alt="Aperçu" className="w-full h-full object-cover" />
								) : (
									<div className="text-center p-4 flex flex-col items-center">
										<Camera size={40} className="text-gray-300 mb-3" strokeWidth={1.5} />
										<span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Aperçu photo</span>
									</div>
								)}
							</div>
							<input type="url" name="image" placeholder="Lien URL de l'image..." value={formData.image} onChange={handleChange}
								className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl outline-none text-xs text-center font-bold" />
						</div>

						{/* COLONNE 3 : PRIX & VALIDATION */}
						<div className="lg:col-span-4 space-y-6 lg:border-l lg:border-gray-100 lg:pl-12 flex flex-col justify-between">
							<div className="space-y-6">
								<div>
									<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Prix (DT)</label>
									<div className="relative">
										<input type="number" step="0.001" name="prix" required value={formData.prix} onChange={handleChange} placeholder="ex: 15.500"
											className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12 font-black text-2xl text-gray-900" />
										<Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={24} />
									</div>
								</div>

								<div>
									<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Disponibilité</label>
									<select name="is_available" value={formData.is_available} onChange={handleChange}
										className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold appearance-none cursor-pointer">
										<option value={true}>En stock (Disponible)</option>
										<option value={false}>Rupture de stock</option>
									</select>
								</div>
							</div>

							<div className="pt-8 flex flex-col gap-3">
								<button type="submit" disabled={loading}
									className={`w-full py-5 text-lg font-black text-white rounded-2xl shadow-xl transition-all ${loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700 shadow-orange-100"}`}>
									{loading ? "Création en cours..." : "Confirmer l'ajout au Menu"}
								</button>
								
								<button 
									type="button" 
									onClick={() => navigate("/admin/menu")}
									className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
								>
									Annuler et quitter
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}