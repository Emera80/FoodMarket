import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import axios from "axios";
import {
	User, Mail, Lock, AtSign, ArrowRight,
	Phone, MapPin, X, Cherry,
} from "lucide-react";

export default function AuthPage() {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [loginData, setLoginData] = useState({ email: "", password: "" });
	const [signupData, setSignupData] = useState({
		username: "", nom: "", email: "", password: "",
		telephone: "", adresse: "", role: "client",
	});

	const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
	const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

	const handleLoginSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const response = await axios.post("http://127.0.0.1:8000/api/token/", loginData);
			localStorage.setItem("access_token", response.data.access);
			localStorage.setItem("refresh_token", response.data.refresh);

			const profileRes = await axios.get(
				`http://127.0.0.1:8000/api/accounts/utilisateurs/?search=${loginData.email}`,
				{ headers: { Authorization: `Bearer ${response.data.access}` } }
			);
			const usersList = profileRes.data.results || profileRes.data;
			const user = Array.isArray(usersList)
				? (usersList.find(u => u.email === loginData.email) || usersList[0])
				: usersList;

			localStorage.setItem('username', user.username || user.nom || loginData.email.split('@')[0]);
			localStorage.setItem('user_role', user.role || 'client');
			if (user.avatar) localStorage.setItem('user_avatar', user.avatar);
			window.dispatchEvent(new Event('authChange'));

			navigate(user.role === 'admin' ? '/admin' : '/');
		} catch {
			toast.error("Email ou mot de passe incorrect.");
		} finally {
			setLoading(false);
		}
	};

	const handleSignupSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			await axios.post("http://127.0.0.1:8000/api/accounts/utilisateurs/", signupData);
			toast.success("Compte créé ! Connectez-vous.");
			setIsLogin(true);
		} catch {
			toast.error("Erreur lors de l'inscription. L'email ou le pseudo est déjà pris.");
		} finally {
			setLoading(false);
		}
	};

	const imageUrl =
		"https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=1170&auto=format&fit=crop";

	return (
		<div className="fixed inset-0 z-50 bg-white overflow-y-auto">

			{/* Bouton fermer */}
			<button
				onClick={() => navigate("/")}
				className="absolute top-4 left-4 z-50 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
				<X size={22} className="text-gray-600" />
			</button>

			{/* ===== LAYOUT MOBILE / TABLETTE (< lg) ===== */}
			<div className="lg:hidden min-h-screen flex flex-col">

				{/* Bannière image + titre */}
				<div
					className="relative h-52 sm:h-64 bg-cover bg-center shrink-0"
					style={{ backgroundImage: `url(${imageUrl})` }}
				>
					<div className="absolute inset-0 bg-black/50"></div>
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
						<div className="flex items-center gap-2 text-white mb-2">
							<span className="text-3xl font-extrabold">F</span>
							<Cherry size={24} className="text-orange-500" />
							<span className="text-3xl font-extrabold">d Market</span>
						</div>
						<p className="text-white/80 text-sm font-medium">
							{isLogin ? "Connectez-vous à votre compte" : "Créez votre compte gratuitement"}
						</p>
					</div>
				</div>

				{/* Toggle onglets */}
				<div className="flex mx-4 mt-4 bg-gray-100 rounded-2xl p-1">
					<button
						onClick={() => { setIsLogin(true); setError(""); }}
						className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
					>
						Se connecter
					</button>
					<button
						onClick={() => { setIsLogin(false); setError(""); }}
						className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
					>
						S'inscrire
					</button>
				</div>

				{/* Formulaire */}
				<div className="flex-1 px-4 pt-6 pb-8">

					{/* LOGIN */}
					{isLogin && (
						<form onSubmit={handleLoginSubmit} className="space-y-5 max-w-md mx-auto">
							<div>
								<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresse Email</label>
								<div className="relative">
									<input type="email" name="email" required value={loginData.email} onChange={handleLoginChange}
										className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-11" />
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								</div>
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mot de passe</label>
								<div className="relative">
									<input type="password" name="password" required value={loginData.password} onChange={handleLoginChange}
										className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-11" />
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								</div>
							</div>
							<button type="submit" disabled={loading}
								className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl shadow-lg text-base font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all mt-2">
								{loading ? "Connexion..." : <><span>Accéder</span> <ArrowRight size={18} /></>}
							</button>
						</form>
					)}

					{/* SIGNUP */}
					{!isLogin && (
						<form onSubmit={handleSignupSubmit} className="space-y-4 max-w-md mx-auto">
							<div>
								<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nom complet</label>
								<div className="relative">
									<input type="text" name="nom" required value={signupData.nom} onChange={handleSignupChange}
										className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-11" />
									<User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pseudo</label>
									<div className="relative">
										<input type="text" name="username" required value={signupData.username} onChange={handleSignupChange}
											className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-10 text-sm" />
										<AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
									</div>
								</div>
								<div>
									<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Téléphone</label>
									<div className="relative">
										<input type="tel" name="telephone" required value={signupData.telephone} onChange={handleSignupChange}
											className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-10 text-sm" />
										<Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
									</div>
								</div>
							</div>
							<div>
								<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresse Email</label>
								<div className="relative">
									<input type="email" name="email" required value={signupData.email} onChange={handleSignupChange}
										className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-11" />
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresse</label>
									<div className="relative">
										<input type="text" name="adresse" required value={signupData.adresse} onChange={handleSignupChange}
											className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-10 text-sm" />
										<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
									</div>
								</div>
								<div>
									<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mot de passe</label>
									<div className="relative">
										<input type="password" name="password" required value={signupData.password} onChange={handleSignupChange}
											className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none pl-10 text-sm" />
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
									</div>
								</div>
							</div>
							<button type="submit" disabled={loading}
								className="w-full py-4 rounded-2xl shadow-lg text-base font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all mt-2">
								{loading ? "Création..." : "Créer mon compte"}
							</button>
						</form>
					)}
				</div>
			</div>

			{/* ===== LAYOUT DESKTOP (>= lg) : split animé original ===== */}
			<div className="hidden lg:block h-screen">

				{/* FORMULAIRE LOGIN */}
				<div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-12 lg:px-24 xl:px-32 transition-all duration-700 ease-in-out
					${isLogin ? "translate-x-0 opacity-100 z-20 pointer-events-auto" : "translate-x-full opacity-0 z-10 pointer-events-none"}`}>
					<h2 className="text-4xl font-extrabold text-gray-900 mb-8">Se connecter</h2>
					{error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}
					<form onSubmit={handleLoginSubmit} className="space-y-6 w-full max-w-md">
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-2">Adresse Email</label>
							<div className="relative">
								<input type="email" name="email" required value={loginData.email} onChange={handleLoginChange}
									className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12" />
								<Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
							</div>
						</div>
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
							<div className="relative">
								<input type="password" name="password" required value={loginData.password} onChange={handleLoginChange}
									className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12" />
								<Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
							</div>
						</div>
						<button type="submit" disabled={loading}
							className="w-full flex justify-center items-center py-4 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all mt-4">
							{loading ? "Connexion..." : <><span>Accéder</span> <ArrowRight className="ml-2" size={20} /></>}
						</button>
					</form>
				</div>

				{/* FORMULAIRE SIGNUP */}
				<div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-12 lg:px-20 xl:px-24 transition-all duration-700 ease-in-out
					${isLogin ? "translate-x-0 opacity-0 z-10 pointer-events-none" : "translate-x-full opacity-100 z-20 pointer-events-auto"}`}>
					<h2 className="text-4xl font-extrabold text-gray-900 mb-8">S'inscrire</h2>
					{error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}
					<form onSubmit={handleSignupSubmit} className="grid grid-cols-2 gap-5 w-full max-w-xl">
						<div className="col-span-2">
							<label className="block text-sm font-bold text-gray-700 mb-1">Nom complet</label>
							<div className="relative">
								<input type="text" name="nom" required value={signupData.nom} onChange={handleSignupChange}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
								<User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							</div>
						</div>
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1">Pseudo</label>
							<div className="relative">
								<input type="text" name="username" required value={signupData.username} onChange={handleSignupChange}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
								<AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							</div>
						</div>
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
							<div className="relative">
								<input type="tel" name="telephone" required value={signupData.telephone} onChange={handleSignupChange}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
								<Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							</div>
						</div>
						<div className="col-span-2">
							<label className="block text-sm font-bold text-gray-700 mb-1">Adresse Email</label>
							<div className="relative">
								<input type="email" name="email" required value={signupData.email} onChange={handleSignupChange}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
								<Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							</div>
						</div>
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1">Adresse de livraison</label>
							<div className="relative">
								<input type="text" name="adresse" required value={signupData.adresse} onChange={handleSignupChange}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
								<MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							</div>
						</div>
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
							<div className="relative">
								<input type="password" name="password" required value={signupData.password} onChange={handleSignupChange}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
								<Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
							</div>
						</div>
						<div className="col-span-2 pt-2">
							<button type="submit" disabled={loading}
								className="w-full py-4 rounded-xl shadow-lg text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all">
								{loading ? "Création..." : "Créer mon compte"}
							</button>
						</div>
					</form>
				</div>

				{/* PANNEAU IMAGE GLISSANT */}
				<div className={`absolute top-0 w-1/2 h-full transition-transform duration-700 ease-in-out z-30 shadow-2xl
					${isLogin ? "left-1/2 translate-x-0" : "left-1/2 -translate-x-full"}`}>
					<div className="relative w-full h-full bg-cover bg-center flex flex-col justify-center items-center text-center px-16 text-white"
						style={{ backgroundImage: `url(${imageUrl})` }}>
						<div className="absolute inset-0 bg-black/40"></div>
						<div className="relative z-40 space-y-6">
							<h1 className="text-5xl font-extrabold tracking-tight">
								{isLogin ? "Nouveau ici ?" : "De retour ?"}
							</h1>
							<p className="text-lg font-medium opacity-90 max-w-md">
								{isLogin
									? "Créez votre compte pour commander les meilleurs plats de Tunis directement chez vous."
									: "Connectez-vous pour retrouver vos restaurants favoris et suivre vos commandes."}
							</p>
							<button
								onClick={() => { setIsLogin(!isLogin); setError(""); }}
								className="mt-8 px-10 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-bold hover:bg-white hover:text-gray-900 transition-colors">
								{isLogin ? "Je veux m'inscrire" : "Je veux me connecter"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
