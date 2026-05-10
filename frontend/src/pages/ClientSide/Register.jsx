import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { User, Mail, Phone, MapPin, Lock, AtSign } from "lucide-react";

export default function Register() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		username: "",
		nom: "",
		email: "",
		telephone: "",
		adresse: "",
		password: "",
		role: "client", // Par défaut, on crée un client. Seul un admin ou la console Django peut changer ça en 'admin'
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Appel à ton API d'utilisateurs
			await api.post("/accounts/utilisateurs/", formData);

			alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
			navigate("/login"); // Redirection vers la page de connexion
		} catch (err) {
			console.error(err);
			setError(
				"Erreur lors de l'inscription. L'email ou le pseudo est peut-être déjà pris.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
			<div className="max-w-2xl w-full">
				<div className="text-center mb-10">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Rejoignez FoodMarket
					</h2>
					<p className="mt-2 text-gray-600">
						Vous avez déjà un compte ?{" "}
						<Link
							to="/login"
							className="font-medium text-orange-600 hover:text-orange-500">
							Connectez-vous ici
						</Link>
					</p>
				</div>

				<div className="bg-white py-10 px-8 shadow-sm border border-gray-100 rounded-3xl">
					{error && (
						<div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-sm font-medium text-center">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Colonne 1 */}
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										Nom complet
									</label>
									<div className="relative">
										<input
											type="text"
											name="nom"
											required
											value={formData.nom}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11"
										/>
										<User
											className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
											size={18}
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										Pseudo
									</label>
									<div className="relative">
										<input
											type="text"
											name="username"
											required
											value={formData.username}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11"
										/>
										<AtSign
											className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
											size={18}
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										Adresse Email
									</label>
									<div className="relative">
										<input
											type="email"
											name="email"
											required
											value={formData.email}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11"
										/>
										<Mail
											className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
											size={18}
										/>
									</div>
								</div>
							</div>

							{/* Colonne 2 */}
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										Téléphone
									</label>
									<div className="relative">
										<input
											type="tel"
											name="telephone"
											required
											value={formData.telephone}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11"
										/>
										<Phone
											className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
											size={18}
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										Adresse de livraison
									</label>
									<div className="relative">
										<input
											type="text"
											name="adresse"
											required
											value={formData.adresse}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11"
										/>
										<MapPin
											className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
											size={18}
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										Mot de passe
									</label>
									<div className="relative">
										<input
											type="password"
											name="password"
											required
											value={formData.password}
											onChange={handleChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11"
										/>
										<Lock
											className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
											size={18}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-10">
							<button
								type="submit"
								disabled={loading}
								className={`w-full py-4 text-base font-bold text-white rounded-xl shadow-md transition-all ${loading ? "bg-orange-400" : "bg-orange-600 hover:bg-orange-700"}`}>
								{loading ? "Création en cours..." : "Créer mon compte"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
