import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { 
  Camera, Coins, Tag, Utensils, 
  ArrowLeft, Loader2, UtensilsCrossed, Save 
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditDish() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
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
		const fetchData = async () => {
			try {
				const [restRes, platRes] = await Promise.all([
					api.get("/catalog/restaurants/"),
					api.get(`/catalog/plats/${id}/`),
				]);
				setRestaurants(restRes.data.results || restRes.data);
				
				// On s'assure que le prix est un nombre pour l'input
				const platData = platRes.data;
				platData.prix = parseFloat(platData.prix);
				setFormData(platData);
				
			} catch (err) {
				toast.error("Impossible de charger les données");
				navigate("/admin/menu");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [id, navigate]);

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
		setIsSaving(true);
		// Structure pour l'API (on s'assure que le prix est renvoyé en chaîne)
		const dataToSave = {
			...formData,
			prix: formData.prix.toString()
		};

		try {
			await api.put(`/catalog/plats/${id}/`, dataToSave);
			toast.success("Modifications enregistrées !");
			navigate("/admin/menu");
		} catch (err) {
			toast.error("Erreur lors de la sauvegarde");
		} finally {
			setIsSaving(false);
		}
	};

	if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-orange-600"><Loader2 className="animate-spin mr-2" /> Chargement du plat...</div>;

	return (
		<div className="min-h-screen bg-gray-50 p-6 md:p-10">
			<div className="w-full max-w-[1600px] mx-auto">
				
				{/* HEADER */}
				<div className="mb-8 flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-black text-gray-900">
							Modifier : <span className="text-orange-600">{formData.nom}</span>
						</h1>
						<p className="text-gray-500 mt-2 font-medium">Mettez à jour les informations et la photo de ce plat.</p>
					</div>
					<button 
						onClick={() => navigate("/admin/menu")}
						className="flex items-center gap-2 px-5 py-3 bg-white text-gray-600 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
					>
						<ArrowLeft size={18} /> Retour à la gestion
					</button>
				</div>

				<form onSubmit={handleSubmit} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
						
						{/* COLONNE 1 : INFOS (Copie conforme création) */}
						<div className="lg:col-span-5 space-y-6">
							<div>
								<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Restaurant associé</label>
								<div className="relative">
									<select name="restaurant" required value={formData.restaurant} onChange={handleChange}
										className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12 appearance-none cursor-pointer font-bold">
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
									<input type="text" name="categorie" list="categories-plats" required placeholder="Entrée, Plat..." value={formData.categorie} onChange={handleChange}
										className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12 font-bold" />
									<Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<datalist id="categories-plats">
										<option value="Entrée" /><option value="Plat principal" /><option value="Dessert" /><option value="Boisson" />
									</datalist>
								</div>
							</div>

							<div>
								<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
								<textarea name="description" rows="5" value={formData.description} onChange={handleChange}
									className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold"></textarea>
							</div>
						</div>

						{/* COLONNE 2 : IMAGE AVEC PRÉVIEW (Réintégrée) */}
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
                            {/* Input URL pour changer l'image */}
							<input type="url" name="image" placeholder="Lien URL de la nouvelle image..." value={formData.image} onChange={handleChange}
								className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl outline-none text-xs text-center font-bold" />
						</div>

						{/* COLONNE 3 : PRIX & SAUVEGARDE */}
						<div className="lg:col-span-4 space-y-6 lg:border-l lg:border-gray-100 lg:pl-12 flex flex-col justify-between">
							<div className="space-y-6">
								<div>
									<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Prix (DT)</label>
									<div className="relative">
										<input type="number" step="0.001" name="prix" required value={formData.prix} onChange={handleChange}
											className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12 font-black text-2xl text-gray-900" />
										<Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={24} />
									</div>
								</div>

								<div>
									<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Disponibilité</label>
									<select name="is_available" value={formData.is_available} onChange={handleChange}
										className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold appearance-none cursor-pointer">
										<option value={true}>En stock (Disponible)</option>
										<option value={false}>Rupture de stock (Indisponible)</option>
									</select>
								</div>
							</div>

							<div className="pt-8 flex flex-col gap-3">
								<button type="submit" disabled={isSaving}
									className={`w-full py-5 text-lg font-black text-white rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${isSaving ? "bg-gray-400" : "bg-gray-900 hover:bg-black shadow-gray-200"}`}>
									{isSaving ? <Loader2 className="animate-spin"/> : <Save size={20} />}
									{isSaving ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
								</button>
								
								<button type="button" onClick={() => navigate("/admin/menu")}
									className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
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