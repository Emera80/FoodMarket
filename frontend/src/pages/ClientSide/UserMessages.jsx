import React from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Loader2, InboxIcon } from 'lucide-react';
import { useUserMessages } from '../../hooks/useUserMessages';

export default function UserMessages() {
  const {
    messages, loading,
    expanded, toggleExpanded,
    targetId, targetRef,
    userRole,
  } = useUserMessages();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-orange-600">
        <Loader2 className="animate-spin mr-2" /> Chargement…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        {userRole === 'admin' ? 'Mes échanges avec les clients' : 'Mes échanges avec le support'}
      </h1>
      <p className="text-gray-400 font-medium mb-8">
        Retrouvez ici toutes vos demandes et les réponses de notre équipe.
      </p>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <InboxIcon size={56} strokeWidth={1.5} className="mb-4" />
          <p className="font-bold text-lg">Aucun message pour le moment.</p>
          <p className="text-sm mt-1">Utilisez le formulaire de contact pour nous écrire.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => {
            const isTarget = m.id === targetId;
            const isOpen   = expanded === m.id;
            const hasReply = !!m.reponse;

            return (
              <div
                key={m.id}
                ref={isTarget ? targetRef : null}
                className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${isTarget ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-100'}`}
              >
                <button
                  onClick={() => toggleExpanded(m.id)}
                  className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${hasReply ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-900">{m.sujet}</p>
                        {hasReply && isTarget && (
                          <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase animate-pulse">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-400">
                        {new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {hasReply && (
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-black uppercase">Répondu</span>
                    )}
                    {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-8 pb-8 pt-2 bg-gray-50 border-t border-gray-100 space-y-5">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Votre message :</p>
                      <p className="text-gray-700 font-medium italic leading-relaxed">"{m.message}"</p>
                    </div>
                    {hasReply ? (
                      <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Réponse de l'équipe support :</p>
                        <p className="text-gray-900 font-bold leading-relaxed">{m.reponse}</p>
                      </div>
                    ) : (
                      <div className="bg-white p-5 rounded-2xl border border-dashed border-orange-200 text-center">
                        <p className="text-sm text-orange-500 font-bold">En attente de réponse…</p>
                        <p className="text-xs text-gray-400 mt-1">Notre équipe reviendra vers vous très bientôt.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
