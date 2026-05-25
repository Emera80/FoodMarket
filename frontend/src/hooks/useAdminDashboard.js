import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const CHART_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#eab308'];

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ventesJour: 0, ventesMois: 0, ventesAnnee: 0,
    nbCommandes: 0, nbClients: 0, restaurantsActifs: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData]     = useState([]);
  const [topPlats, setTopPlats]   = useState([]);
  const [flopPlats, setFlopPlats] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, usersRes, restRes, platsRes] = await Promise.all([
          api.get('/orders/commandes/'),
          api.get('/accounts/utilisateurs/'),
          api.get('/catalog/restaurants/'),
          api.get('/catalog/plats/'),
        ]);

        const orders      = ordersRes.data.results || ordersRes.data;
        const users       = usersRes.data.results  || usersRes.data;
        const restaurants = restRes.data.results   || restRes.data;
        const plats       = platsRes.data.results  || platsRes.data;

        const now          = new Date();
        const currentYear  = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate  = now.getDate();

        let vJour = 0, vMois = 0, vAnnee = 0;
        const monthlyData     = {};
        const restaurantSales = {};
        const platsQuantities = {};

        plats.forEach(p => { platsQuantities[p.nom] = 0; });

        orders.forEach(cmd => {
          const d     = new Date(cmd.date);
          const total = parseFloat(cmd.total);

          if (d.getFullYear() === currentYear) {
            vAnnee += total;
            if (d.getMonth() === currentMonth) {
              vMois += total;
              if (d.getDate() === currentDate) vJour += total;
            }
          }

          const monthName = d.toLocaleString('fr-FR', { month: 'short' });
          if (!monthlyData[monthName]) monthlyData[monthName] = { name: monthName, CA: 0, Commandes: 0 };
          monthlyData[monthName].CA         += total;
          monthlyData[monthName].Commandes  += 1;

          const restName = cmd.restaurant_nom || `Resto #${cmd.restaurant}`;
          if (!restaurantSales[restName]) restaurantSales[restName] = 0;
          restaurantSales[restName] += total;

          if (cmd.items) {
            cmd.items.forEach(item => {
              const platName = item.plat_nom || `Plat #${item.plat}`;
              platsQuantities[platName] = (platsQuantities[platName] ?? 0) + item.quantite;
            });
          }
        });

        setStats({
          ventesJour: vJour, ventesMois: vMois, ventesAnnee: vAnnee,
          nbCommandes: orders.length,
          nbClients: users.length,
          restaurantsActifs: restaurants.filter(r => r.is_active).length,
        });

        setChartData(Object.values(monthlyData));
        setPieData(Object.entries(restaurantSales).map(([name, value]) => ({ name, value })));

        const sortedPlats = Object.entries(platsQuantities)
          .map(([name, qte]) => ({ name, qte }))
          .sort((a, b) => b.qte - a.qte);

        setTopPlats(sortedPlats.slice(0, 5));
        setFlopPlats(sortedPlats.slice(-5).reverse());
      } catch {
        toast.error('Erreur lors du calcul des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { loading, stats, chartData, pieData, topPlats, flopPlats };
}
