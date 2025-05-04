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
      background: '#282828', 
      padding: '10px 20px',
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #353535',
      position: 'sticky',
      top: 0,
      zIndex: 200
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Mostrar botón de menú siempre, no solo en escritorio */}
        <button 
          onClick={onToggleSidebar} 
          style={{ 
            marginRight: '15px', 
            background: 'transparent',
            border: 'none',
            color: '#D7B615',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="fas fa-bars"></i>
        </button>
        <span style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.87)' }}>Mi Legado</span>
      </div>
      
      {/* Mostrar botón de Logout si hay usuario */}
      {currentUser && (
        <button 
          onClick={handleLogout} 
          style={{ 
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid #D7B615',
            borderRadius: '5px',
            color: '#D7B615',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <i className="fas fa-sign-out-alt" style={{ marginRight: '5px' }}></i>
          Cerrar Sesión
        </button>
      )}
    </header>
  );
}

export default Header; 