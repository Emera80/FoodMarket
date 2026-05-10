import React from "react";
import LandingPage from "./pages/LandingPage";
import "./index.css";
// Ajout de Outlet ici !
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 

//import client
import Login from "./pages/ClientSide/Login";
import Register from "./pages/ClientSide/Register";
import ProfilePage from "./pages/ClientSide/ProfilePage";
import Checkout from "./pages/ClientSide/Checkout";
import RestaurantDetail from "./pages/ClientSide/RestaurantDetailPage";
import Navbar from "./components/Navbar";
import CreateRestaurant from "./pages/AdminSide/CreateRestaurant";
import CreatePlat from "./pages/AdminSide/CreateDish";
import AuthPage from "./pages/ClientSide/AuthPage";
import RestaurantsPage from "./pages/ClientSide/RestaurantPage";
import CartSidebar from "./components/CartSidebar";
import OrderHistory from "./pages/ClientSide/OrderHistory";
import PlatsPage from "./pages/ClientSide/PlatsPage";
import UserMessages from "./pages/ClientSide/UserMessages";
import Footer from "./components/Footer";

//import admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminSide/AdminDashbord";
import AdminOrders from "./pages/AdminSide/AdminOrders";
import AdminMenu from "./pages/AdminSide/AdminMenu";
import AdminRoute from "./components/AdminRoute";
import EditDish from "./pages/AdminSide/EditDish";
import AdminRestaurants from "./pages/AdminSide/AdminRestaurants";
import EditRestaurant from "./pages/AdminSide/EditRestaurant";
import AdminUsers from "./pages/AdminSide/AdminUsers";
import AdminSettings from "./pages/AdminSide/AdminSettings";
import AdminMessages from "./pages/AdminSide/AdminMessages";


// 1. CRÉATION DU LAYOUT CLIENT
// Tout ce qui est ici aura la Navbar et la CartSidebar
const ClientLayout = () => {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

function App() {
	return (
		<Router>
			<Toaster
				position="top-center"
				toastOptions={{
					duration: 3000,
					style: {
						background: "#333",
						color: "#fff",
						borderRadius: "16px",
						fontWeight: "bold",
					},
					success: { style: { background: "#16a34a" } }, 
					error: { style: { background: "#ef4444" } }, 
				}}
			/>
			
			<Routes>
				{/* --- LE MONDE CLIENT --- */}
				{/* On enveloppe les pages clients pour qu'elles aient la Navbar */}
				<Route element={<ClientLayout />}>
					<Route path="/" element={<LandingPage />} />
					<Route path="/login" element={<AuthPage />} />
					<Route path="/register" element={<AuthPage />} />
					<Route path="/profile" element={<ProfilePage />} />
					<Route path="/checkout" element={<Checkout />} />
					<Route path="/orderhistory" element={<OrderHistory />} />
					<Route path="/restaurant/:id" element={<RestaurantDetail />} />
					<Route path="/restaurants" element={<RestaurantsPage />} />
					<Route path="/profile/messages" element={<UserMessages />} />
					<Route path="/plats" element={<PlatsPage />} />
					
					{/* J'ai gardé ces routes ici pour ne pas casser tes liens, 
						mais tu pourras les déplacer dans l'espace admin plus tard */}
					
				</Route>

				{/* --- LE MONDE ADMIN PROTÉGÉ --- */}
				{/* Ces pages n'ont plus la Navbar cliente ! */}
				<Route 
					path="/admin" 
					element={
						<AdminRoute>
							<AdminLayout />
						</AdminRoute>
					}
				>
					<Route index element={<AdminDashboard />} /> 
					<Route path="orders" element={<AdminOrders />} />
					<Route path="menu" element={<AdminMenu />} />
					<Route path="restaurants" element={<AdminRestaurants />} />
					<Route path="users" element={<AdminUsers />} />
					<Route path="dish/edit/:id" element={<EditDish />} />
					<Route path="restaurant/edit/:id" element={<EditRestaurant />} />
					<Route path="restaurant/add" element={<CreateRestaurant />} />
					<Route path="dish/add" element={<CreatePlat />} />
					<Route path="settings" element={<AdminSettings />} />
					<Route path="messages" element={<AdminMessages />} />
				</Route>
				
				<Route path="*" element={<div className="flex items-center justify-center h-screen font-black text-4xl">404 - Page non trouvée</div>} />
			</Routes>
		</Router>
	);
}

export default App;