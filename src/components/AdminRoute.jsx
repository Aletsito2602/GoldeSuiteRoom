import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isUserAdmin } from '../utils/authUtils';
import { useAuth } from '../context/AuthContext'; // Ajustar la ruta para que coincida con el resto del proyecto

// Componente para proteger rutas de administrador
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    };
    
    checkAdminStatus();
  }, [user]);

  if (loading) return <div className="loading">Cargando...</div>;
  
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/unauthorized" />;
  
  return children;
};

export default AdminRoute; 