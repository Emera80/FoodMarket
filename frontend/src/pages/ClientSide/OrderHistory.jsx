import React from "react";
import { Link } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, Clock, AlertCircle, Download, Loader2 } from "lucide-react";
import { useOrderHistory } from "../../hooks/useOrderHistory";
import { useDownloadInvoice } from "../../hooks/useDownloadInvoice";
import StatusBadge from "../../components/ui/StatusBadge";

export default function OrderHistory() {
  const {
    loading,
    commandes, expandedOrderId,
    toggleOrder,
    getRestaurantName, getPlatName, formatDate,
  } = useOrderHistory();

  const { downloadInvoice, loading: downloading } = useDownloadInvoice();

  // Condition métier : Facture téléchargeable uniquement si validée ou livrée
  const isInvoiceAvailable = (status) => ['confirmee', 'en_preparation', 'en_livraison', 'livree'].includes(status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-orange-600">
        Chargement de vos commandes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Package className="text-orange-600" size={32} />
          <h1 className="text-3xl font-black text-gray-900">Historique des commandes</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Mes commandes</h2>

          {commandes.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
              <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-bold text-lg">Vous n'avez pas encore passé de commande.</p>
              <Link to="/restaurants" className="inline-block mt-4 text-orange-600 font-bold hover:underline">
                Découvrir nos restaurants
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {commandes.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors bg-white">
                  <div
                    onClick={() => toggleOrder(order.id)}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-base font-black text-gray-900">Commande #{order.id}</h3>
                      <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                        <span className="text-gray-700 font-bold">{getRestaurantName(order.restaurant)}</span>
                        • {formatDate(order.date)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-10">
                      <span className="font-black text-gray-900 text-lg">{parseFloat(order.total).toFixed(3)} DT</span>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={order.statut_livraison} />
                        <button className="text-gray-400 hover:text-gray-700">
                          {expandedOrderId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="bg-gray-50 p-5 border-t border-gray-100 animate-fadeIn">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Détail des articles</h4>
                      <div className="space-y-3 mb-6">
                        {order.items && order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">x{item.quantite}</span>
                              <span className="font-medium text-gray-700">{item.plat_nom || getPlatName(item.plat)}</span>
                            </div>
                            <span className="font-bold text-gray-500">{parseFloat(item.sous_total).toFixed(3)} DT</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                          <Clock size={16} className="text-gray-400" />
                          Paiement : {order.mode_paiement.replace('_', ' ')}
                        </div>
                        <Link
                          to={`/restaurant/${order.restaurant}`}
                          className="px-6 py-2.5 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-200 transition-all"
                        >
                          Commander à nouveau
                        </Link>
                        {isInvoiceAvailable(order.statut_livraison) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadInvoice(order.id, order.id);
                            }}
                            disabled={downloading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                          >
                            {downloading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Download size={16} />
                            )}
                            Télécharger la facture
                          </button>
                        )}
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
