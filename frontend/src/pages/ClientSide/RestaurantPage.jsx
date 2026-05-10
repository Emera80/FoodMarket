import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Search, SlidersHorizontal, Star, UtensilsCrossed } from "lucide-react";

export default function RestaurantsPage() {
	const [restaurants, setRestaurants] = useState([]);
	const [plats, setPlats] = useState([]);
	const [loading, setLoading] = useState(true);

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("Toutes");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [resRest, resPlat] = await Promise.all([
					api.get("/catalog/restaurants/"),
					api.get("/catalog/plats/"),
				]);
				setRestaurants(resRest.data.results || resRest.data);
				setPlats(resPlat.data.results || resPlat.data);
				setLoading(false);
			} catch (err) {
				console.error(err);
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Extraire les types de cuisine uniques
	const categories = [
		"Toutes",
		...new Set(restaurants.map((r) => r.type_cuisine)),
	];

	// LOGIQUE DE FILTRE (Cuisine OU Plats)
	const filteredRestaurants = restaurants.filter((restaurant) => {
		// 1. Filtre par catégorie de cuisine
		const matchesCategory =
			selectedCategory === "Toutes" ||
			restaurant.type_cuisine === selectedCategory;

		// 2. Filtre par recherche (Nom du restaurant OU nom d'un de ses plats)
		const matchesSearch =
			restaurant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
			plats.some(
				(p) =>
					p.restaurant === restaurant.id &&
					p.nom.toLowerCase().includes(searchTerm.toLowerCase()),
			);

		return matchesCategory && matchesSearch;
	});

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center font-bold text-orange-600">
				Chargement...
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50 pb-20">
			{/* En-tête de page */}
			<div className="bg-white border-b border-gray-200 pt-12 pb-8 px-4">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-4xl font-black text-gray-900 mb-2">
						Découvrez nos restaurants
					</h1>
					<p className="text-gray-500 mb-8 font-medium">
						Trouvez vos saveurs préférées parmi nos partenaires tunisiens.
					</p>

					{/* Barre de recherche intelligente */}
					<div className="flex flex-col md:flex-row gap-4">
						<div className="relative flex-1">
							<Search
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
								size={22}
							/>
							<input
								type="text"
								placeholder="Cherchez un restaurant ou un plat (ex: Burger, Couscous...)"
								className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none text-lg"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<button className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all">
							<SlidersHorizontal size={20} />
							Filtres
						</button>
					</div>

					{/* Catégories (Cuisine) */}
					<div className="flex gap-3 mt-8 overflow-x-auto pb-2 scrollbar-hide">
						{categories.map((cat) => (
							<button
								key={cat}
								onClick={() => setSelectedCategory(cat)}
								className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
									selectedCategory === cat
										? "bg-orange-600 text-white shadow-lg"
										: "bg-white border border-gray-200 text-gray-600 hover:border-orange-200"
								}`}>
								{cat}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Grille des résultats */}
			<div className="max-w-7xl mx-auto px-4 mt-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{filteredRestaurants.map((restaurant) => (
						<Link
							to={`/restaurant/${restaurant.id}`}
							key={restaurant.id}
							className="group bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
							<div className="h-56 relative overflow-hidden">
								<img
									src={restaurant.image}
									alt={restaurant.nom}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
								/>
								<div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
									<Star
										size={16}
										className="text-orange-500"
										fill="currentColor"
									/>
									<span className="text-sm font-bold text-gray-900">
										{restaurant.note_moyenne}
									</span>
								</div>
							</div>
							<div className="p-6">
								<div className="flex justify-between items-start mb-2">
									<h3 className="text-xl font-extrabold text-gray-900">
										{restaurant.nom}
									</h3>
									<span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded">
										{restaurant.type_cuisine}
									</span>
								</div>
								<p className="text-gray-500 text-sm line-clamp-1 mb-4">
									{restaurant.adresse}
								</p>
								<div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-sm font-bold text-gray-700">
									<span className="flex items-center gap-1.5">
										<UtensilsCrossed size={16} className="text-gray-400" /> Menu
										varié
									</span>
									<span className="ml-auto text-gray-400 font-medium">
										{restaurant.temps_livraison_estime} min
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>

				{filteredRestaurants.length === 0 && (
					<div className="text-center py-20">
						<p className="text-2xl font-bold text-gray-400">
							Aucun restaurant trouvé pour "{searchTerm}"
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
