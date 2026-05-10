import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  TrendingUp, ShoppingCart, Users, Store, DollarSign, Award, ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ventesJour: 0, ventesMois: 0, ventesAnnee: 0,
    nbCommandes: 0, nbClients: 0, restaurantsActifs: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [topPlats, setTopPlats] = useState([]);
  const [flopPlats, setFlopPlats] = useState([]);

  // Couleurs pour le PieChart
  const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#eab308'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('access_token');
      try {
        // On récupère TOUTES les données nécessaires
        const [ordersRes, usersRes, restRes, platsRes] = await Promise.all([
          api.get('/orders/commandes/'),
          api.get('/accounts/utilisateurs/'),
          api.get('/catalog/restaurants/'),
          api.get('/catalog/plats/') // Pour le Flop 5
        ]);

        const orders = ordersRes.data.results || ordersRes.data;
        const users = usersRes.data.results || usersRes.data;
        const restaurants = restRes.data.results || restRes.data;
        const plats = platsRes.data.results || platsRes.data;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();

        let vJour = 0, vMois = 0, vAnnee = 0;
        
        // Objets pour l'agrégation des données des graphiques
        const monthlyData = {};
        const restaurantSales = {};
        const platsQuantities = {};

        // Initialiser tous les plats à 0 (important pour le Flop 5)
        plats.forEach(p => { platsQuantities[p.nom] = 0; });

        // Analyse de chaque commande
        orders.forEach(cmd => {
          const d = new Date(cmd.date);
          const total = parseFloat(cmd.total);
          
          // 1. Calcul des KPI [cite: 436-439]
          if (d.getFullYear() === currentYear) {
            vAnnee += total;
            if (d.getMonth() === currentMonth) {
              vMois += total;
              if (d.getDate() === currentDate) {
                vJour += total;
              }
            }
          }

          // 2. Préparation des données pour Courbe & Histogramme [cite: 443-444]
          const monthName = d.toLocaleString('fr-FR', { month: 'short' });
          if (!monthlyData[monthName]) monthlyData[monthName] = { name: monthName, CA: 0, Commandes: 0 };
          monthlyData[monthName].CA += total;
          monthlyData[monthName].Commandes += 1;

          // 3. Préparation des données pour la répartition par restaurant 
          const restName = cmd.restaurant_nom || `Resto #${cmd.restaurant}`;
          if (!restaurantSales[restName]) restaurantSales[restName] = 0;
          restaurantSales[restName] += total;

          // 4. Comptage des plats pour Top/Flop 
          if (cmd.items) {
            cmd.items.forEach(item => {
              const platName = item.plat_nom || `Plat #${item.plat}`;
              if (platsQuantities[platName] !== undefined) {
                platsQuantities[platName] += item.quantite;
              } else {
                platsQuantities[platName] = item.quantite;
              }
            });
          }
        });

        // Mise à jour du State des KPI
        setStats({
          ventesJour: vJour, ventesMois: vMois, ventesAnnee: vAnnee,
          nbCommandes: orders.length, nbClients: users.length,
          restaurantsActifs: restaurants.filter(r => r.is_active).length
        });

        // Formatage pour Recharts
        setChartData(Object.values(monthlyData));
        setPieData(Object.entries(restaurantSales).map(([name, value]) => ({ name, value })));

        // Tri pour Top 5 et Flop 5 
        const sortedPlats = Object.entries(platsQuantities)
          .map(([name, qte]) => ({ name, qte }))
          .sort((a, b) => b.qte - a.qte);
        
        setTopPlats(sortedPlats.slice(0, 5));
        setFlopPlats(sortedPlats.slice(-5).reverse()); // Les pires en premier

      } catch (error) {
        toast.error("Erreur lors du calcul des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-orange-600">Calcul des statistiques...</div>;

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tableau de bord analytique</h1>
        <p className="text-gray-500 font-medium">Suivi des performances et indicateurs clés de votre Marketplace.</p>
      </div>

      {/* ==================== 1. WIDGETS KPI  ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: "Ventes Jour", val: `${stats.ventesJour.toFixed(3)} DT`, icon: <DollarSign size={20}/>, color: "text-green-600", bg: "bg-green-50" },
          { title: "Ventes Mois", val: `${stats.ventesMois.toFixed(3)} DT`, icon: <TrendingUp size={20}/>, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Ventes Année", val: `${stats.ventesAnnee.toFixed(3)} DT`, icon: <Award size={20}/>, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Commandes", val: stats.nbCommandes, icon: <ShoppingCart size={20}/>, color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Clients", val: stats.nbClients, icon: <Users size={20}/>, color: "text-pink-600", bg: "bg-pink-50" },
          { title: "Restos Actifs", val: stats.restaurantsActifs, icon: <Store size={20}/>, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className={`w-10 h-10 mb-3 flex items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.title}</p>
            <h3 className="text-xl font-black text-gray-900 mt-1 truncate">{card.val}</h3>
          </div>
        ))}
      </div>

      {/* ==================== 2. VISUALISATIONS GRAPHIQUES [cite: 443-445] ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graphique Mixte : Courbe CA & Histogramme Commandes */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Évolution CA & Commandes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {/* Composant chart mixte de Recharts */}
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                
                {/* Histogramme des commandes  */}
                <Bar yAxisId="right" dataKey="Commandes" fill="#fbd38d" radius={[4, 4, 0, 0]} barSize={30} />
                {/* Courbe d'évolution du CA  */}
                <Line yAxisId="left" type="monotone" dataKey="CA" stroke="#ea580c" strokeWidth={4} dot={{r: 6, strokeWidth: 2}} activeDot={{r: 8}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition des ventes par restaurant  */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Répartition des ventes (Restaurants)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(3)} DT`} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ==================== 3. PERFORMANCES PRODUITS  ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TOP 5 */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 text-green-600 rounded-xl"><TrendingUp size={20}/></div>
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Top 5 Plats (Les plus vendus)</h3>
          </div>
          <div className="space-y-4">
            {topPlats.map((plat, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-black text-gray-300 text-lg w-4">{index + 1}</span>
                  <span className="font-bold text-gray-900">{plat.name}</span>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 font-black text-xs rounded-full">{plat.qte} ventes</span>
              </div>
            ))}
          </div>
        </div>

        {/* FLOP 5 */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl"><ArrowDownRight size={20}/></div>
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Flop 5 Plats (Les moins vendus)</h3>
          </div>
          <div className="space-y-4">
            {flopPlats.map((plat, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-black text-gray-300 text-lg w-4">{index + 1}</span>
                  <span className="font-bold text-gray-900">{plat.name}</span>
                </div>
                <span className="px-3 py-1 bg-red-50 text-red-700 font-black text-xs rounded-full">{plat.qte} ventes</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}