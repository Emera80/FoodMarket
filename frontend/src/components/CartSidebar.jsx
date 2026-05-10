import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import toast from 'react-hot-toast';

export default function CartSidebar() {
	const navigate = useNavigate();
	// On récupère tout ce dont on a besoin depuis notre Context
	const {
		isCartOpen,
		setIsCartOpen,
		cart,
		updateQuantity,
		removeFromCart,
		cartTotal,
	} = useCart();

	// Frais de livraison fixes (en Dinars Tunisiens)
	const fraisLivraison = cart.length > 0 ? 3.5 : 0;
	const totalGeneral = cartTotal + fraisLivraison;

	// Fonction pour aller au paiement et fermer le tiroir
    const handleCheckout = () => {
        setIsCartOpen(false); // On ferme le tiroir quoi qu'il arrive
        
        const token = localStorage.getItem('access_token');

        if (token) {
            // Si l'utilisateur est connecté, il passe au paiement
            navigate('/checkout');
        } else {
            // Sinon, on l'envoie vers la page d'authentification
            // On peut même ajouter un petit message pour expliquer pourquoi
            toast.error("Veuillez vous connecter ou créer un compte pour finaliser votre commande.");
            navigate('/login', { state: { from: '/checkout' } });
        }
    };

	return (
		<>
			{/* 1. L'OVERLAY SOMBRE (Fond cliquable pour fermer le tiroir) */}
			<div
				className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
					isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
				}`}
				onClick={() => setIsCartOpen(false)}></div>

			{/* 2. LE TIROIR LATÉRAL */}
			<div
				className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
					isCartOpen ? "translate-x-0" : "translate-x-full"
				}`}>
				{/* En-tête du panier */}
				<div className="flex justify-between items-center p-6 border-b border-gray-100">
					<h2 className="text-2xl font-extrabold text-gray-900">
						Votre panier
					</h2>
					<button
						onClick={() => setIsCartOpen(false)}
						className="p-2 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
						<X size={20} />
					</button>
				</div>

				{/* Liste des articles (Zone avec défilement) */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{cart.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-gray-400">
							<span className="text-6xl mb-4">🛒</span>
							<p className="font-medium text-lg">Votre panier est vide</p>
							<p className="text-sm mt-2 text-center">
								Ajoutez des plats délicieux pour commencer votre commande.
							</p>
						</div>
					) : (
						cart.map((item) => (
							<div
								key={item.id}
								className="flex gap-4 items-center bg-white p-2 rounded-2xl">
								{/* Image du plat */}
								<div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
									<img
										src={item.image}
										alt={item.nom}
										className="w-full h-full object-cover"
									/>
								</div>

								{/* Infos texte */}
								<div className="flex-1">
									<h3 className="font-bold text-gray-900 text-sm line-clamp-1">
										{item.nom}
									</h3>
									<p className="text-orange-600 font-extrabold text-sm mt-1">
										{parseFloat(item.prix).toFixed(3)} DT
									</p>
								</div>

								{/* Contrôleur de quantité style Maquette */}
								<div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1 shrink-0">
									<button
										onClick={() =>
											item.quantity > 1
												? updateQuantity(item.id, item.quantity - 1)
												: removeFromCart(item.id)
										}
										className="w-7 h-7 flex items-center justify-center bg-white text-gray-600 rounded shadow-sm hover:text-orange-600 transition-colors">
										{item.quantity > 1 ? (
											<Minus size={14} strokeWidth={3} />
										) : (
											<Trash2
												size={14}
												strokeWidth={2.5}
												className="text-red-500"
											/>
										)}
									</button>

									<span className="font-bold text-sm w-4 text-center">
										{item.quantity}
									</span>

									<button
										onClick={() => updateQuantity(item.id, item.quantity + 1)}
										className="w-7 h-7 flex items-center justify-center bg-white text-gray-600 rounded shadow-sm hover:text-orange-600 transition-colors">
										<Plus size={14} strokeWidth={3} />
									</button>
								</div>
							</div>
						))
					)}
				</div>

				{/* Pied de page : Totaux et Bouton d'action */}
				{cart.length > 0 && (
					<div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
						<div className="space-y-3 mb-6">
							<div className="flex justify-between text-gray-500 font-medium text-sm">
								<span>Sous-total</span>
								<span>{cartTotal.toFixed(3)} DT</span>
							</div>
							<div className="flex justify-between text-gray-500 font-medium text-sm">
								<span>Frais de livraison</span>
								<span>{fraisLivraison.toFixed(3)} DT</span>
							</div>
							<div className="flex justify-between text-gray-900 font-extrabold text-lg pt-3 border-t border-gray-100">
								<span>Total</span>
								<span className="text-orange-600">
									{totalGeneral.toFixed(3)} DT
								</span>
							</div>
						</div>

						<button
							onClick={handleCheckout}
							className="w-full py-4 rounded-xl shadow-lg shadow-orange-200 text-lg font-extrabold text-white bg-orange-600 hover:bg-orange-700 transition-all active:scale-[0.98]">
							Valider la commande
						</button>
					</div>
				)}
			</div>
		</>
	);
}
