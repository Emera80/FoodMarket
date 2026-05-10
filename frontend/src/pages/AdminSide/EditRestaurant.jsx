import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { Camera, Clock, MapPin, Phone, ArrowLeft, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function EditRestaurant() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [existingCategories, setExistingCategories] = useState([]);

	const [formData, setFormData] = useState({
		nom: "", type_cuisine: "", description: "", horaires: "",
		image: "", adresse: "", telephone: "", temps_livraison_estime: "", is_active: true,
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [catsRes, restRes] = await Promise.all([
					api.get("/catalog/restaurants/categories/"),
					api.get(`/catalog/restaurants/${id}/`),
				]);
				setExistingCategories(catsRes.data);
				setFormData(restRes.data);
			} catch (err) {
				toast.error("Impossible de charger les données");
				navigate("/admin/restaurants");
			} finally { setLoading(false); }
		};
		fetchData();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === "is_active") {
			setFormData({ ...formData, [name]: value === "true" });
		} else {
			setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		try {
			await api.put(`/catalog/restaurants/${id}/`, formData);
			toast.success("Modifications enregistrées !");
			navigate("/admin/restaurants");
		} catch (err) {
			toast.error("Erreur lors de la sauvegarde.");
		} finally { setIsSaving(false); }
	};

	if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-orange-600"><Loader2 className="animate-spin mr-2" /> Chargement...</div>;

	return (
		<div className="min-h-screen bg-gray-50 p-6 md:p-10">
			<div className="w-full max-w-[1600px] mx-auto">
				<div className="mb-8 flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-extrabold text-gray-900">Modifier : <span className="text-orange-600">{formData.nom}</span></h1>
						<p className="text-gray-500 mt-2">Mettez à jour les informations de cet établissement.</p>
					</div>
					<button onClick={() => navigate("/admin/restaurants")} className="flex items-center gap-2 px-5 py-3 bg-white text-gray-600 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
						<ArrowLeft size={18} /> Retour à la gestion
					</button>
				</div>

				<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
						{/* COLONNE 1 */}
						<div className="lg:col-span-5 space-y-6">
							<div>
								<label className="block text-sm font-bold text-gray-700 mb-2">Nom de l'établissement</label>
								<input type="text" name="nom" required value={formData.nom} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold" />
							</div>
							<div>
								<label className="block text-sm font-bold text-gray-700 mb-2">Catégorie de cuisine</label>
								<input type="text" name="type_cuisine" list="categories-existantes" required value={formData.type_cuisine} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold" />
								<datalist id="categories-existantes">
									{existingCategories.map((cat, index) => <option key={index} value={cat} />)}
								</datalist>
							</div>
							<div>
								<label className="block text-sm font-bold text-gray-700 mb-2">Description / Slogan</label>
								<textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold"></textarea>
							</div>
							<div>
								<label className="block text-sm font-bold text-gray-700 mb-2">Horaires d'ouverture</label>
								<div className="relative">
									<input type="text" name="horaires" placeholder="09:00 - 23:00" value={formData.horaires} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11 font-bold" />
									<Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
								</div>
							</div>
						</div>

						{/* COLONNE 2 */}
						<div className="lg:col-span-3 flex flex-col pt-1">
							<label className="block text-sm font-bold text-gray-700 mb-2 text-center lg:text-left">Image / Logo</label>
							<div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative mb-4">
								{formData.image ? <img src={formData.image} alt="Aperçu" className="w-full h-full object-cover" /> : <div className="text-center p-4 flex flex-col items-center"><Camera size={40} className="text-gray-300 mb-3" strokeWidth={1.5} /><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Aperçu</span></div>}
							</div>
							<input type="url" name="image" placeholder="Lien URL de l'image..." value={formData.image} onChange={handleChange} className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl outline-none text-xs text-center font-bold" />
						</div>

						{/* COLONNE 3 */}
						<div className="lg:col-span-4 space-y-6 lg:border-l lg:border-gray-100 lg:pl-12 flex flex-col justify-between">
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">Adresse</label>
									<div className="relative">
										<input type="text" name="adresse" required value={formData.adresse} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11 font-bold" />
										<MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
									</div>
								</div>
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
									<div className="relative">
										<input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11 font-bold" />
										<Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
									</div>
								</div>
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">Temps de livraison (min)</label>
									<div className="relative">
										<input type="number" name="temps_livraison_estime" required value={formData.temps_livraison_estime} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11 font-bold" />
										<Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" size={18} />
									</div>
								</div>
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">Statut</label>
									<select name="is_active" value={formData.is_active} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold appearance-none cursor-pointer">
										<option value={true}>Actif</option>
										<option value={false}>Inactif</option>
									</select>
								</div>
							</div>
							<div className="pt-8 flex flex-col gap-3">
								<button type="submit" disabled={isSaving} className={`w-full py-4 text-base font-bold text-white rounded-xl shadow-md transition-all flex justify-center items-center gap-2 ${isSaving ? "bg-gray-400" : "bg-gray-900 hover:bg-black"}`}>
									{isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
									{isSaving ? "Sauvegarde..." : "Enregistrer les modifications"}
								</button>
                                <button type="button" onClick={() => navigate("/admin/restaurants")} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
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