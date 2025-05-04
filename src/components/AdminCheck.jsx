import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente utilitario para mostrar contenido solo a usuarios administradores
 * 
 * Uso: 
 * <AdminCheck fallback={<div>No eres administrador</div>}>
 *   <ContenidoSoloParaAdmins />
 * </AdminCheck>
 */
function AdminCheck({ children, fallback = null, loadingComponent = null }) {
  const { currentUser, isAdmin, loadingAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    // Solo verificamos cuando la autenticación inicialmente ha terminado
    if (!loadingAuth) {
      setChecking(false);
    }
  }, [loadingAuth]);
  
  // Si estamos verificando, mostrar el componente de carga
  if (checking) {
    return loadingComponent || <div>Verificando permisos...</div>;
  }
  
  // Si no hay usuario autenticado, mostrar el fallback
  if (!currentUser) {
    return fallback;
  }
  
  // Si el usuario no es admin, mostrar el fallback
  if (!isAdmin) {
    return fallback;
  }
  
  // Si el usuario es admin, mostrar el contenido hijo
  return <>{children}</>;
}

export default AdminCheck; 