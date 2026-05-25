import React from 'react';
import { Search, Eye, User, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, X, Loader2 } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import UserAvatar from '../../components/ui/UserAvatar';

export default function AdminUsers() {
  const {
    loading,
    searchTerm, setSearchTerm,
    selectedUser, userOrders, loadingOrders,
    isModalOpen,
    openUserProfile, closeModal,
    filteredUsers,
  } = useAdminUsers();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-orange-600">
        <Loader2 className="animate-spin mr-2" /> Chargement des clients...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 font-medium">Consultez la liste de vos clients et leurs performances d'achat.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un client par nom ou email..."
          className="flex-1 bg-transparent border-none outline-none font-bold text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date Inscription</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.nom} size="md" />
                      <div>
                        <p className="font-bold text-gray-900">{user.nom || 'Utilisateur sans nom'}</p>
                        <p className="text-xs text-gray-400 font-medium lowercase">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {user.email}</p>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><Phone size={14} /> {user.telephone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Inconnue'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openUserProfile(user)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                      title="Voir la fiche client"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE FICHE UTILISATEUR */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl animate-slideUp">

            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <User className="text-orange-600" /> Profil Client
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto max-h-[75vh]">

              {/* Infos Personnelles */}
              <div className="space-y-6">
                <div className="bg-orange-50 p-6 rounded-3xl text-center">
                  <UserAvatar name={selectedUser.nom} size="lg" className="mx-auto mb-4 shadow-sm" />
                  <h3 className="text-lg font-black text-gray-900">{selectedUser.nom}</h3>
                  <p className="text-sm font-bold text-orange-600">Client fidèle</p>
                </div>
                <div className="space-y-4 px-2">
                  {[
                    { icon: <Mail size={18} className="text-gray-400" />, label: 'Email', value: selectedUser.email },
                    { icon: <Phone size={18} className="text-gray-400" />, label: 'Téléphone', value: selectedUser.telephone || 'N/A' },
                    { icon: <MapPin size={18} className="text-gray-400 mt-1" />, label: 'Adresse', value: selectedUser.adresse || 'Non renseignée' },
                    { icon: <Calendar size={18} className="text-gray-400" />, label: 'Membre depuis', value: new Date(selectedUser.created_at).toLocaleDateString('fr-FR') },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      {icon}
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats & Historique */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-5 rounded-3xl text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingBag size={20} className="text-orange-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Commandes</span>
                    </div>
                    <p className="text-3xl font-black">{selectedUser.nombre_commandes}</p>
                  </div>
                  <div className="bg-orange-600 p-5 rounded-3xl text-white shadow-lg shadow-orange-100">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total dépensé</span>
                    </div>
                    <p className="text-3xl font-black">{parseFloat(selectedUser.total_depense).toFixed(3)} <span className="text-sm">DT</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag size={14} /> Historique d'achat
                  </h3>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    {loadingOrders ? (
                      <div className="p-8 text-center text-gray-400 font-bold italic">Chargement de l'historique...</div>
                    ) : userOrders.length > 0 ? (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                          <tr>
                            <th className="px-6 py-3">Commande</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {userOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-black text-gray-900">#{ord.id}</td>
                              <td className="px-6 py-4 font-bold text-gray-500">{new Date(ord.date).toLocaleDateString('fr-FR')}</td>
                              <td className="px-6 py-4 text-right font-black text-orange-600">{parseFloat(ord.total).toFixed(3)} DT</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-400 font-bold italic">Aucune commande passée.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
