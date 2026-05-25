import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export function useAdminMessages() {
  const [messages, setMessages]         = useState([]);
  const [selectedMsg, setSelectedMsg]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [replyText, setReplyText]       = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/contact/');
      setMessages(res.data.results || res.data);
    } catch {
      toast.error('Erreur messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteMsg = async (id) => {
    try {
      await api.delete(`/catalog/contact/${id}/`);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMsg?.id === id) setSelectedMsg(null);
      toast.success('Message supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error('La réponse ne peut pas être vide.');
    setSendingReply(true);
    try {
      await api.post(`/catalog/contact/${selectedMsg.id}/repondre/`, { reponse: replyText });
      toast.success('Réponse envoyée au client !');
      setReplyText('');
      setSelectedMsg(prev => ({ ...prev, est_lu: true }));
    } catch {
      toast.error("Erreur lors de l'envoi de la réponse.");
    } finally {
      setSendingReply(false);
    }
  };

  return {
    messages, selectedMsg, setSelectedMsg,
    loading,
    replyText, setReplyText,
    sendingReply,
    deleteMsg, handleReply,
  };
}
