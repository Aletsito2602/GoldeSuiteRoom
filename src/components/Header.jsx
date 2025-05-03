import React from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Recibe la función onToggleSidebar y el prop isMobile
function Header({ onToggleSidebar, isMobile }) { 
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header style={{ 
      background: 'transparent', // Hacer transparente o un color oscuro como #2a2a2a
      padding: '10px 20px', // Añadir padding horizontal
      display: 'flex', 
      alignItems: 'center', // Centrar verticalmente
      justifyContent: 'space-between',
      borderBottom: '1px solid #353535' // Borde inferior más oscuro
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Renderizar botón toggle solo si NO es móvil */}
        {!isMobile && (
          <button onClick={onToggleSidebar} style={{ marginRight: '15px' }}>☰</button> 
        )}
        <span style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.87)' }}>Golden Suite Room</span> // Asegurar color claro
      </div>
      
      {/* Mostrar botón de Logout si hay usuario */}
      {currentUser && (
        <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          Cerrar Sesión
        </button>
      )}
    </header>
  );
}

export default Header; 