import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    // Si pas de token ou si le rôle n'est pas 'admin' -> redirection accueil
    if (!token || role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;