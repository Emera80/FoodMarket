import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RestaurantList() {
	const [restaurants, setRestaurants] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// L'appel à ton API Django REST Framework
		axios
			.get(`${import.meta.env.VITE_API_URL}/api/catalog/restaurants/`)
			.then((response) => {
				setRestaurants(response.data);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Erreur de connexion à l'API :", error);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<div className="text-center py-10 text-orange-600 font-bold">
				Chargement des restaurants...
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-12">
			<h2 className="text-3xl font-bold text-gray-800 mb-8">
				Nos restaurants partenaires
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{restaurants.map((restaurant) => (
					// Regarde bien ici : on utilise Link pour que toute la carte soit cliquable !
					<Link
						to={`/restaurant/${restaurant.id}`}
						key={restaurant.id}
						className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all group block">
						<div className="h-48 bg-gray-100 overflow-hidden">
							{restaurant.image ? (
								<img
									src={restaurant.image}
									alt={restaurant.nom}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400">
									Pas d'image
								</div>
							)}
						</div>

						<div className="p-5">
							<h3 className="text-xl font-bold text-gray-900 mb-1">
								{restaurant.nom}
							</h3>
							<p className="text-sm text-gray-500 mb-3">
								{restaurant.type_cuisine}
							</p>

							<div className="flex justify-between items-center text-sm font-medium">
								<span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
									⭐ {restaurant.note_moyenne}
								</span>
								<span className="text-gray-600">
									⏳ {restaurant.temps_livraison_estime} min
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
