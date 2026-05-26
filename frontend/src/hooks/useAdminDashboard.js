/**
 * useAdminDashboard.js
 * -------------------
 * Hook personnalisé centralisant la logique de calcul des statistiques du Dashboard Admin.
 * 
 * Ce hook récupère les données brutes (commandes, utilisateurs, restaurants, plats) 
 * et effectue des agrégations complexes côté client pour générer des indicateurs 
 * de performance (KPI) et des données pour les graphiques.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/** 
 * Couleurs utilisées pour les graphiques (Recharts/ChartJS). 
 * Correspond à la palette de marque du projet.
 */
export const CHART_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#eab308'];

/**
 * Hook useAdminDashboard
 * @returns {Object} États pour le dashboard (stats, chartData, topPlats, etc.)
 */
export function useAdminDashboard() {
  /** @type {boolean} Gère l'état d'attente lors du calcul massif des données. */
  const [loading, setLoading] = useState(true);

  /** 
   * @type {Object} Statistiques clés (Chiffre d'Affaire temporel et compteurs).
   */
  const [stats, setStats] = useState({
    ventesJour: 0, ventesMois: 0, ventesAnnee: 0,
    nbCommandes: 0, nbClients: 0, restaurantsActifs: 0,
  });

  /** @type {Array} Données formatées pour le graphique linéaire (Ventes par mois). */
  const [chartData, setChartData] = useState([]);
  /** @type {Array} Données pour le graphique en camembert (Ventes par restaurant). */
  const [pieData, setPieData]     = useState([]);
  /** @type {Array} Liste des 5 plats les plus vendus. */
  const [topPlats, setTopPlats]   = useState([]);
  /** @type {Array} Liste des 5 plats les moins vendus (ou non vendus). */
  const [flopPlats, setFlopPlats] = useState([]);

  useEffect(() => {
    /**
     * Fonction interne asynchrone pour orchestrer la récupération et le traitement.
     */
    const fetchDashboardData = async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      try {
        // Récupération simultanée de tous les domaines de données nécessaires.
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

        // Références temporelles pour les calculs de CA.
        const now          = new Date();
        const currentYear  = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate  = now.getDate();

        // Accumulateurs pour le traitement en une seule passe (O(n)).
        let vJour = 0, vMois = 0, vAnnee = 0;
        const monthlyData     = {};
        const restaurantSales = {};
        const platsQuantities = {};

        // Initialisation du dictionnaire des plats pour inclure ceux à 0 vente.
        plats.forEach(p => { platsQuantities[p.nom] = 0; });

        // Itération unique sur toutes les commandes pour extraire les metrics.
        orders.forEach(cmd => {
          const d     = new Date(cmd.date);
          const total = parseFloat(cmd.total);

          // 1. Calcul des Chiffres d'Affaires (CA) glissants.
          if (d.getFullYear() === currentYear) {
            vAnnee += total;
            if (d.getMonth() === currentMonth) {
              vMois += total;
              if (d.getDate() === currentDate) vJour += total;
            }
          }

          // 2. Agrégation par mois pour le graphique temporel.
          const monthName = d.toLocaleString('fr-FR', { month: 'short' });
          if (!monthlyData[monthName]) {
            monthlyData[monthName] = { name: monthName, CA: 0, Commandes: 0 };
          }
          monthlyData[monthName].CA         += total;
          monthlyData[monthName].Commandes  += 1;

          // 3. Agrégation par restaurant (CA par enseigne).
          const restName = cmd.restaurant_nom || `Resto #${cmd.restaurant}`;
          if (!restaurantSales[restName]) restaurantSales[restName] = 0;
          restaurantSales[restName] += total;

          // 4. Calcul des volumes de vente par plat (Top/Flop).
          if (cmd.items) {
            cmd.items.forEach(item => {
              const platName = item.plat_nom || `Plat #${item.plat}`;
              platsQuantities[platName] = (platsQuantities[platName] ?? 0) + item.quantite;
            });
          }
        });

        // Mise à jour de l'état des statistiques globales.
        setStats({
          ventesJour: vJour, ventesMois: vMois, ventesAnnee: vAnnee,
          nbCommandes: orders.length,
          nbClients: users.length,
          restaurantsActifs: restaurants.filter(r => r.is_active).length,
        });

        // Formatage des données pour les graphiques.
        setChartData(Object.values(monthlyData));
        setPieData(Object.entries(restaurantSales).map(([name, value]) => ({ name, value })));

        // Tri des plats par volume pour extraire les performances extrêmes.
        const sortedPlats = Object.entries(platsQuantities)
          .map(([name, qte]) => ({ name, qte }))
          .sort((a, b) => b.qte - a.qte);

        setTopPlats(sortedPlats.slice(0, 5));
        setFlopPlats(sortedPlats.slice(-5).reverse());
        
      } catch (error) {
        console.error("Dashboard Error:", error);
        // On ne montre l'erreur toast que lors du premier chargement pour éviter de spammer l'admin
        if (!isRefresh) toast.error('Erreur lors de la génération des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Mise en place d'un polling (toutes les 30 secondes pour le dashboard)
    // Le dashboard est plus lourd en calculs, on espace un peu plus.
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // API publique du hook.
  return { loading, stats, chartData, pieData, topPlats, flopPlats };
}
