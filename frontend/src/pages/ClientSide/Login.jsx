import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Appel à la route de simplejwt personnalisée (retourne access, refresh + role, user_id, nom)
      const response = await api.post('/token/', formData);

      // On sauvegarde les tokens et les infos utilisateur
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_role', response.data.role);
      localStorage.setItem('user_id', String(response.data.user_id));
      localStorage.setItem('user_nom', response.data.nom);

      // Redirection selon le rôle
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Bon retour parmi nous
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
            créez un compte gratuitement
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium text-center">{error}</div>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Adresse Email</label>
              <div className="relative">
                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <input type="password" name="password" required value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-11" />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all ${loading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'}`}>
                {loading ? 'Connexion en cours...' : (
                  <>
                    Se connecter <ArrowRight className="ml-2" size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}