import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

export function useUserMessages() {
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [searchParams]          = useSearchParams();
  const targetId                = Number(searchParams.get('open'));
  const targetRef               = useRef(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'client');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
      setUserRole(localStorage.getItem('user_role') || 'client');
    };
    window.addEventListener('authChange', handleAuthChange);

    if (isLoggedIn && !localStorage.getItem('user_role')) {
      api.get('/accounts/utilisateurs/').then(res => {
        const users = res.data.results || res.data;
        const user  = users[0] || users;
        if (user.role) {
          setUserRole(user.role);
          localStorage.setItem('user_role', user.role);
        }
      }).catch(err => console.error(err));
    }

    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    const fetchMyMessages = async () => {
      try {
        const res  = await api.get('/catalog/contact/');
        const data = res.data.results || res.data;
        setMessages(data);
        if (targetId) setExpanded(targetId);
      } catch (err) {
        console.error('Erreur chargement messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMessages();
  }, [targetId]);

  useEffect(() => {
    if (targetId && targetRef.current) {
      setTimeout(() => {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [targetId, messages]);

  const toggleExpanded = (id) => setExpanded(prev => prev === id ? null : id);

  return {
    messages, loading,
    expanded, toggleExpanded,
    targetId, targetRef,
    userRole,
  };
}
