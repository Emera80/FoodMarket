import React from 'react';
import { TrendingUp, ShoppingCart, Users, Store, DollarSign, Award, ArrowDownRight } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAdminDashboard, CHART_COLORS } from '../../hooks/useAdminDashboard';
import StatCard from '../../components/ui/StatCard';

export default function AdminDashboard() {
  const { loading, stats, chartData, pieData, topPlats, flopPlats } = useAdminDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-orange-600">
        Calcul des statistiques...
      </div>
    );
  }

  const kpiCards = [
    { title: 'Ventes Jour',   val: `${stats.ventesJour.toFixed(3)} DT`,  icon: <DollarSign size={20}/>, color: 'text-green-600',  bg: 'bg-green-50' },
    { title: 'Ventes Mois',   val: `${stats.ventesMois.toFixed(3)} DT`,  icon: <TrendingUp size={20}/>, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { title: 'Ventes Année',  val: `${stats.ventesAnnee.toFixed(3)} DT`, icon: <Award size={20}/>,      color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Commandes',     val: stats.nbCommandes,                     icon: <ShoppingCart size={20}/>,color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Clients',       val: stats.nbClients,                       icon: <Users size={20}/>,      color: 'text-pink-600',   bg: 'bg-pink-50' },
    { title: 'Restos Actifs', val: stats.restaurantsActifs,               icon: <Store size={20}/>,      color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tableau de bord analytique</h1>
        <p className="text-gray-500 font-medium">Suivi des performances et indicateurs clés de votre Marketplace.</p>
      </div>

      {/* KPI WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Évolution CA & Commandes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Bar yAxisId="right" dataKey="Commandes" fill="#fbd38d" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="left" type="monotone" dataKey="CA" stroke="#ea580c" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Répartition des ventes (Restaurants)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(3)} DT`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP / FLOP PLATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 text-green-600 rounded-xl"><TrendingUp size={20} /></div>
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

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl"><ArrowDownRight size={20} /></div>
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
