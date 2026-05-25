import React from 'react';
import { Mail, Search, Trash2, Send, Clock } from 'lucide-react';
import { useAdminMessages } from '../../hooks/useAdminMessages';

export default function AdminMessages() {
  const {
    messages, selectedMsg, setSelectedMsg,
    loading,
    replyText, setReplyText,
    sendingReply,
    deleteMsg, handleReply,
  } = useAdminMessages();

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fadeIn">
      {/* LISTE DES MESSAGES */}
      <div className="w-1/3 bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h1 className="text-xl font-black text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {messages.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMsg(m)}
              className={`p-5 cursor-pointer transition-all hover:bg-orange-50/50 flex gap-4 ${selectedMsg?.id === m.id ? 'bg-orange-50 border-l-4 border-orange-600' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 font-black">
                {m.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="text-sm font-black text-gray-900 truncate">{m.nom}</h3>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    {new Date(m.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-[11px] font-black text-orange-600 truncate">{m.sujet}</p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{m.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DÉTAIL DU MESSAGE */}
      <div className="flex-1 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {selectedMsg ? (
          <>
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-black shadow-inner">
                  {selectedMsg.nom[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedMsg.nom}</h2>
                  <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {selectedMsg.email} • Reçu le {new Date(selectedMsg.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteMsg(selectedMsg.id)}
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto space-y-6">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mb-2">Objet du message</span>
                <h3 className="text-lg font-black text-gray-900 mb-4">{selectedMsg.sujet}</h3>
                <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line">{selectedMsg.message}</p>
              </div>

              <div className="pt-10 border-t border-dashed border-gray-200">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Répondre au client</h4>
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Écrivez votre réponse ici..."
                    className="w-full bg-white border border-gray-200 rounded-[24px] p-6 text-sm font-medium h-40 outline-none focus:ring-2 focus:ring-orange-500 shadow-inner"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sendingReply}
                    className={`absolute bottom-4 right-4 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all ${sendingReply ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'}`}
                  >
                    <Send size={16} /> {sendingReply ? 'Envoi...' : 'Envoyer la réponse'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <Mail size={80} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-sm opacity-40">Sélectionnez un message pour le lire</p>
          </div>
        )}
      </div>
    </div>
  );
}
