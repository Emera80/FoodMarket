import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader2, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUTS_CONFIG = {
  en_attente:    { label: 'En attente',     color: 'bg-yellow-100 text-yellow-700' },
  confirmee:     { label: 'Confirmée',      color: 'bg-blue-100 text-blue-700'    },
  en_preparation:{ label: 'En préparation', color: 'bg-purple-100 text-purple-700'},
  en_livraison:  { label: 'En livraison',   color: 'bg-indigo-100 text-indigo-700'},
  livree:        { label: 'Livrée',         color: 'bg-green-100 text-green-700'  },
  annulee:       { label: 'Annulée',        color: 'bg-red-100 text-red-700'      },
};

/**
 * CommandList – composant réutilisable affichant un tableau compact des commandes.
 * Props :
 *   limit   (number) – nombre max de lignes à afficher (défaut : toutes)
 *   compact (bool)   – masque certaines colonnes pour un affichage condensé
 */
export default function CommandList({ limit, compact = false }) {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(null);

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      const res = await api.get('/orders/commandes/');
      const data = res.data.results || res.data;
      setCommandes(limit ? data.slice(0, limit) : data);
    } catch {
      toast.error('Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatutChange = async (commandeId, newStatut) => {
    setUpdating(commandeId);
    try {
      await api.patch(`/orders/commandes/${commandeId}/`, { statut: newStatut });
      setCommandes((prev) =>
        prev.map((c) => (c.id === commandeId ? { ...c, statut: newStatut } : c))
      );
      toast.success('Statut mis à jour.');
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-orange-600">
        <Loader2 className="animate-spin mr-2" size={20} /> Chargement…
      </div>
    );
  }

  if (commandes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <PackageOpen size={40} strokeWidth={1.5} className="mb-3" />
        <p className="font-semibold">Aucune commande pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-black tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            {!compact && <th className="px-4 py-3 text-left">Client</th>}
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-center">Statut</th>
            {!compact && <th className="px-4 py-3 text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {commandes.map((cmd) => {
            const cfg = STATUTS_CONFIG[cmd.statut] || { label: cmd.statut, color: 'bg-gray-100 text-gray-600' };
            return (
              <tr key={cmd.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-bold text-gray-800">#{cmd.id}</td>

                {!compact && (
                  <td className="px-4 py-3 text-gray-600">
                    {cmd.client_nom || cmd.user || '—'}
                  </td>
                )}

                <td className="px-4 py-3 text-gray-500">
                  {cmd.created_at
                    ? new Date(cmd.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })
                    : '—'}
                </td>

                <td className="px-4 py-3 text-right font-bold text-gray-800">
                  {cmd.total != null ? `${parseFloat(cmd.total).toFixed(3)} DT` : '—'}
                </td>

                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </td>

                {!compact && (
                  <td className="px-4 py-3 text-center">
                    {updating === cmd.id ? (
                      <Loader2 className="animate-spin inline-block text-orange-500" size={16} />
                    ) : (
                      <select
                        value={cmd.statut}
                        onChange={(e) => handleStatutChange(cmd.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-orange-400 outline-none cursor-pointer"
                      >
                        {Object.entries(STATUTS_CONFIG).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
