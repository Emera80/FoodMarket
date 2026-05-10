// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import {
// 	Package,
// 	ChevronDown,
// 	ChevronUp,
// 	Clock,
// 	AlertCircle,
// } from "lucide-react";

// export default function OrderHistory() {
// 	const navigate = useNavigate();
// 	const [expandedOrderId, setExpandedOrderId] = useState(null);

// 	// États pour stocker nos vraies données
// 	const [commandes, setCommandes] = useState([]);
// 	const [restaurants, setRestaurants] = useState([]);
// 	const [plats, setPlats] = useState([]);
// 	const [loading, setLoading] = useState(true);

// 	useEffect(() => {
// 		const fetchHistorique = async () => {
// 			const token = localStorage.getItem("access_token");

// 			if (!token) {
// 				toast.error("Veuillez vous connecter pour voir votre historique.");
// 				navigate("/login");
// 				return;
// 			}

// 			try {
// 				// On lance 3 requêtes en même temps pour gagner du temps
// 				// 1. Les commandes (protégées par le token)
// 				// 2. Les restaurants (pour avoir les noms)
// 				// 3. Les plats (pour avoir les noms des articles)
// 				const [cmdRes, restRes, platsRes] = await Promise.all([
// 					axios.get("http://127.0.0.1:8000/api/orders/commandes/", {
// 						headers: { Authorization: `Bearer ${token}` },
// 					}),
// 					axios.get("http://127.0.0.1:8000/api/catalog/restaurants/"),
// 					axios.get("http://127.0.0.1:8000/api/catalog/plats/"),
// 				]);

// 				setCommandes(cmdRes.data);
// 				setRestaurants(restRes.data);
// 				setPlats(platsRes.data);
// 			} catch (error) {
// 				console.error("Erreur chargement historique:", error);
// 				toast.error("Impossible de charger l'historique des commandes.");
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		fetchHistorique();
// 	}, [navigate]);

// 	const toggleOrder = (id) => {
// 		setExpandedOrderId(expandedOrderId === id ? null : id);
// 	};

// 	// --- FONCTIONS D'AIDE POUR TRADUIRE LES DONNÉES ---

// 	// Trouver le nom du restaurant à partir de son ID
// 	const getRestaurantName = (id) => {
// 		const rest = restaurants.find((r) => r.id === id);
// 		return rest ? rest.nom : "Restaurant inconnu";
// 	};

// 	// Trouver le nom du plat à partir de son ID
// 	const getPlatName = (id) => {
// 		const plat = plats.find((p) => p.id === id);
// 		return plat ? plat.nom : "Plat inconnu";
// 	};

// 	// Formater la date (ex: 2026-05-12T14:30:00Z -> "12 mai 2026")
// 	const formatDate = (dateString) => {
// 		const options = { day: "2-digit", month: "long", year: "numeric" };
// 		return new Date(dateString).toLocaleDateString("fr-FR", options);
// 	};

// 	// Générer le bon badge selon le statut Django
// 	const renderStatusBadge = (status) => {
// 		switch (status) {
// 			case "en_attente":
// 			case "confirmee":
// 				return (
// 					<span className="px-4 py-1.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-full border border-gray-200">
// 						En attente
// 					</span>
// 				);
// 			case "en_preparation":
// 				return (
// 					<span className="px-4 py-1.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-full border border-blue-100">
// 						En cuisine
// 					</span>
// 				);
// 			case "en_livraison":
// 				return (
// 					<span className="px-4 py-1.5 bg-orange-50 text-orange-600 font-bold text-sm rounded-full border border-orange-100">
// 						En livraison
// 					</span>
// 				);
// 			case "livree":
// 				return (
// 					<span className="px-4 py-1.5 bg-green-50 text-green-600 font-bold text-sm rounded-full border border-green-100">
// 						Livrée
// 					</span>
// 				);
// 			case "annulee":
// 				return (
// 					<span className="px-4 py-1.5 bg-red-50 text-red-600 font-bold text-sm rounded-full border border-red-100">
// 						Annulée
// 					</span>
// 				);
// 			default:
// 				return (
// 					<span className="px-4 py-1.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-full">
// 						Inconnu
// 					</span>
// 				);
// 		}
// 	};

// 	// --- AFFICHAGE ---

// 	if (loading) {
// 		return (
// 			<div className="min-h-screen flex items-center justify-center font-bold text-orange-600">
// 				Chargement de vos commandes...
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="min-h-screen bg-gray-50 py-10 px-4">
// 			<div className="max-w-4xl mx-auto">
// 				<div className="flex items-center gap-3 mb-8">
// 					<Package className="text-orange-600" size={32} />
// 					<h1 className="text-3xl font-black text-gray-900">
// 						8. Historique des commandes
// 					</h1>
// 				</div>

// 				<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
// 					<h2 className="text-lg font-bold text-gray-900 mb-6">
// 						Mes commandes
// 					</h2>

// 					{commandes.length === 0 ? (
// 						<div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
// 							<AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
// 							<p className="text-gray-500 font-bold text-lg">
// 								Vous n'avez pas encore passé de commande.
// 							</p>
// 							<Link
// 								to="/restaurants"
// 								className="inline-block mt-4 text-orange-600 font-bold hover:underline">
// 								Découvrir nos restaurants
// 							</Link>
// 						</div>
// 					) : (
// 						<div className="space-y-4">
// 							{commandes.map((order) => (
// 								<div
// 									key={order.id}
// 									className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors bg-white">
// 									{/* LIGNE PRINCIPALE DE LA COMMANDE */}
// 									<div
// 										onClick={() => toggleOrder(order.id)}
// 										className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors gap-4">
// 										<div className="flex-1">
// 											<h3 className="text-base font-black text-gray-900">
// 												Commande #{order.id}
// 											</h3>
// 											<p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
// 												<span className="text-gray-700 font-bold">
// 													{getRestaurantName(order.restaurant)}
// 												</span>
// 												• {formatDate(order.date)}
// 											</p>
// 										</div>

// 										<div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-10">
// 											<span className="font-black text-gray-900 text-lg">
// 												{parseFloat(order.total).toFixed(3)} DT
// 											</span>
// 											<div className="flex items-center gap-4">
// 												{renderStatusBadge(order.statut_livraison)}
// 												<button className="text-gray-400 hover:text-gray-700">
// 													{expandedOrderId === order.id ? (
// 														<ChevronUp size={20} />
// 													) : (
// 														<ChevronDown size={20} />
// 													)}
// 												</button>
// 											</div>
// 										</div>
// 									</div>

// 									{/* DÉTAIL DÉROULANT (ACCORDÉON) */}
// 									{expandedOrderId === order.id && (
// 										<div className="bg-gray-50 p-5 border-t border-gray-100 animate-fadeIn">
// 											<h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
// 												Détail des articles
// 											</h4>

// 											<div className="space-y-3 mb-6">
// 												{order.items &&
// 													order.items.map((item, index) => (
// 														<div
// 															key={index}
// 															className="flex justify-between items-center text-sm">
// 															<div className="flex items-center gap-3">
// 																<span className="font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
// 																	x{item.quantite}
// 																</span>
// 																<span className="font-medium text-gray-700">
// 																	{getPlatName(item.plat)}
// 																</span>
// 															</div>
// 															<span className="font-bold text-gray-500">
// 																{parseFloat(item.sous_total).toFixed(3)} DT
// 															</span>
// 														</div>
// 													))}
// 											</div>

// 											<div className="flex flex-wrap gap-3">
// 												<div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
// 													<Clock size={16} className="text-gray-400" />
// 													Paiement : {order.mode_paiement.replace("_", " ")}
// 												</div>
// 												<Link
// 													to={`/restaurant/${order.restaurant}`}
// 													className="px-6 py-2.5 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-200 transition-all">
// 													Commander à nouveau
// 												</Link>
// 											</div>
// 										</div>
// 									)}
// 								</div>
// 							))}
// 						</div>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
	Package,
	ChevronDown,
	ChevronUp,
	Clock,
	AlertCircle,
} from "lucide-react";

export default function OrderHistory() {
	const navigate = useNavigate();
	const [expandedOrderId, setExpandedOrderId] = useState(null);

	// États pour stocker nos vraies données
	const [commandes, setCommandes] = useState([]);
	const [restaurants, setRestaurants] = useState([]);
	const [plats, setPlats] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchHistorique = async () => {
			const token = localStorage.getItem("access_token");

			if (!token) {
				toast.error("Veuillez vous connecter pour voir votre historique.");
				navigate("/login");
				return;
			}

			try {
				// On lance 3 requêtes en même temps pour gagner du temps
				const [cmdRes, restRes, platsRes] = await Promise.all([
					api.get("/orders/commandes/"),
					api.get("/catalog/restaurants/"),
					api.get("/catalog/plats/"),
				]);

				setCommandes(cmdRes.data.results || cmdRes.data);
				setRestaurants(restRes.data.results || restRes.data);
				setPlats(platsRes.data.results || platsRes.data);
			} catch (error) {
				console.error("Erreur chargement historique:", error);
				toast.error("Impossible de charger l'historique des commandes.");
			} finally {
				setLoading(false);
			}
		};

		fetchHistorique();
	}, [navigate]);

	const toggleOrder = (id) => {
		setExpandedOrderId(expandedOrderId === id ? null : id);
	};

	// --- FONCTIONS D'AIDE POUR TRADUIRE LES DONNÉES ---

	// Trouver le nom du restaurant à partir de son ID
	const getRestaurantName = (id) => {
		const rest = restaurants.find((r) => r.id === id);
		return rest ? rest.nom : "Restaurant inconnu";
	};

	// Trouver le nom du plat à partir de son ID
	const getPlatName = (id) => {
		const plat = plats.find((p) => p.id === id);
		return plat ? plat.nom : "Plat inconnu";
	};

	// Formater la date (ex: 2026-05-12T14:30:00Z -> "12 mai 2026")
	const formatDate = (dateString) => {
		const options = { day: "2-digit", month: "long", year: "numeric" };
		return new Date(dateString).toLocaleDateString("fr-FR", options);
	};

	// Générer le bon badge selon le statut Django
	const renderStatusBadge = (status) => {
		switch (status) {
			case "en_attente":
			case "confirmee":
			case "en_preparation":
				return (
					<span className="px-4 py-1.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-full border border-gray-200">
						En attente
					</span>
				);
			case "en_livraison":
				return (
					<span className="px-4 py-1.5 bg-orange-50 text-orange-600 font-bold text-sm rounded-full border border-orange-100">
						En livraison
					</span>
				);
			case "livree":
				return (
					<span className="px-4 py-1.5 bg-green-50 text-green-600 font-bold text-sm rounded-full border border-green-100">
						Livrée
					</span>
				);
			case "annulee":
				return (
					<span className="px-4 py-1.5 bg-red-50 text-red-600 font-bold text-sm rounded-full border border-red-100">
						Annulée
					</span>
				);
			default:
				return (
					<span className="px-4 py-1.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-full">
						Inconnu
					</span>
				);
		}
	};

	// --- AFFICHAGE ---

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center font-bold text-orange-600">
				Chargement de vos commandes...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-10 px-4">
			<div className="max-w-6xl mx-auto"> {/* MODIFIÉ ICI : max-w-4xl -> max-w-6xl */}
				<div className="flex items-center gap-3 mb-8">
					<Package className="text-orange-600" size={32} />
					<h1 className="text-3xl font-black text-gray-900">
						8. Historique des commandes
					</h1>
				</div>

				<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
					<h2 className="text-lg font-bold text-gray-900 mb-6">
						Mes commandes
					</h2>

					{commandes.length === 0 ? (
						<div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
							<AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
							<p className="text-gray-500 font-bold text-lg">
								Vous n'avez pas encore passé de commande.
							</p>
							<Link
								to="/restaurants"
								className="inline-block mt-4 text-orange-600 font-bold hover:underline">
								Découvrir nos restaurants
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{commandes.map((order) => (
								<div
									key={order.id}
									className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors bg-white">
									{/* LIGNE PRINCIPALE DE LA COMMANDE */}
									<div
										onClick={() => toggleOrder(order.id)}
										className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors gap-4">
										<div className="flex-1">
											<h3 className="text-base font-black text-gray-900">
												Commande #{order.id}
											</h3>
											<p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
												<span className="text-gray-700 font-bold">
													{getRestaurantName(order.restaurant)}
												</span>
												• {formatDate(order.date)}
											</p>
										</div>

										<div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-10">
											<span className="font-black text-gray-900 text-lg">
												{parseFloat(order.total).toFixed(3)} DT
											</span>
											<div className="flex items-center gap-4">
												{renderStatusBadge(order.statut_livraison)}
												<button className="text-gray-400 hover:text-gray-700">
													{expandedOrderId === order.id ? (
														<ChevronUp size={20} />
													) : (
														<ChevronDown size={20} />
													)}
												</button>
											</div>
										</div>
									</div>

									{/* DÉTAIL DÉROULANT (ACCORDÉON) */}
									{expandedOrderId === order.id && (
										<div className="bg-gray-50 p-5 border-t border-gray-100 animate-fadeIn">
											<h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
												Détail des articles
											</h4>

											<div className="space-y-3 mb-6">
												{order.items &&
													order.items.map((item, index) => (
														<div
															key={index}
															className="flex justify-between items-center text-sm">
															<div className="flex items-center gap-3">
																<span className="font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
																	x{item.quantite}
																</span>
																<span className="font-medium text-gray-700">
																	{item.plat_nom || getPlatName(item.plat)}
																</span>
															</div>
															<span className="font-bold text-gray-500">
																{parseFloat(item.sous_total).toFixed(3)} DT
															</span>
														</div>
													))}
											</div>

											<div className="flex flex-wrap gap-3">
												<div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
													<Clock size={16} className="text-gray-400" />
													Paiement : {order.mode_paiement.replace("_", " ")}
												</div>
												<Link
													to={`/restaurant/${order.restaurant}`}
													className="px-6 py-2.5 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-200 transition-all">
													Commander à nouveau
												</Link>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}