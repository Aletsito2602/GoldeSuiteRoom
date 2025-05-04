import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUserAdmin } from '../utils/authUtils';

// Recibe el estado isOpen como prop para controlar la visibilidad
function Sidebar({ isOpen }) { 
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar si el usuario actual es administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        const adminStatus = await isUserAdmin(currentUser.uid);
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdminStatus();
  }, [currentUser]);

  // Función para determinar qué tab está activo basado en parámetros de URL
  const getActiveTab = () => {
    const path = location.pathname;
    // Si estamos en la página principal, verificar si hay un parámetro de tab en la URL
    if (path === '/') {
      const searchParams = new URLSearchParams(location.search);
      const tab = searchParams.get('tab');
      if (tab) return tab;
      return 'comunidad'; // Tab por defecto
    }
    
    // Para otras rutas específicas
    if (path.startsWith('/admin/')) return ''; // No seleccionar ningún tab general para rutas admin
    return '';
  };

  // Estilo base para el sidebar
  const sidebarBaseStyle = {
    width: '250px',
    background: '#353535',
    height: 'calc(100vh - 57px)',
    borderRight: '1px solid #444',
    color: 'rgba(255, 255, 255, 0.8)',
    flexShrink: 0,
    position: 'fixed',
    top: '57px',
    left: 0,
    overflowY: 'auto',
    zIndex: 150,
    transition: 'transform 0.3s ease',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
  };

  // Estilo para los elementos de navegación
  const tabStyle = {
    padding: '12px 15px',
    margin: '8px 15px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  // Estilo para el tab activo
  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#444',
    color: '#D7B615',
    border: '2px solid #D7B615',
    fontWeight: 'bold',
  };

  // Estilo para los tabs inactivos
  const inactiveTabStyle = {
    ...tabStyle,
    backgroundColor: 'transparent',
    color: '#eee',
    border: '1px solid #555',
  };

  // Obtiene el tab activo actual
  const activeTab = getActiveTab();

  return (
    <aside 
      style={sidebarBaseStyle} 
      className={isOpen ? 'sidebar open' : 'sidebar closed'}
    >
      <div style={{ padding: '20px 15px 5px' }}>
        <h2 style={{ color: 'white', borderBottom: '1px solid #555', paddingBottom: '10px', textAlign: 'left' }}>Navegación</h2>
      </div>
      
      <div style={{ padding: '15px 0' }}>
        {/* Tabs de navegación con enlaces directos a parámetros de URL */}
        <Link 
          to="/?tab=comunidad" 
          style={{ textDecoration: 'none' }}
        >
          <div style={activeTab === 'comunidad' ? activeTabStyle : inactiveTabStyle}>
            <i className="fas fa-users" style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}></i>
            Comunidad
          </div>
        </Link>

        <Link 
          to="/?tab=streaming" 
          style={{ textDecoration: 'none' }}
        >
          <div style={activeTab === 'streaming' ? activeTabStyle : inactiveTabStyle}>
            <i className="fas fa-video" style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}></i>
            Streaming
          </div>
        </Link>

        <Link 
          to="/?tab=acerca" 
          style={{ textDecoration: 'none' }}
        >
          <div style={activeTab === 'acerca' ? activeTabStyle : inactiveTabStyle}>
            <i className="fas fa-info-circle" style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}></i>
            Acerca De
          </div>
        </Link>

        <Link 
          to="/?tab=perfil" 
          style={{ textDecoration: 'none' }}
        >
          <div style={activeTab === 'perfil' ? activeTabStyle : inactiveTabStyle}>
            <i className="fas fa-user" style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}></i>
            Mi Perfil
          </div>
        </Link>
      </div>

      {/* Sección de administración - solo visible para admins */}
      {isAdmin && (
        <div style={{ padding: '0 15px', marginTop: '30px' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid #555', paddingBottom: '10px', textAlign: 'left' }}>
            Administración
          </h3>
          <div style={{ padding: '15px 0' }}>
            <Link 
              to="/admin/users"
              style={{ textDecoration: 'none' }}
            >
              <div 
                style={{
                  ...tabStyle,
                  color: '#FF9800',
                  border: location.pathname === '/admin/users' ? '2px solid #FF9800' : '1px solid #555',
                  backgroundColor: location.pathname === '/admin/users' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                }}
              >
                <i className="fas fa-user-shield" style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}></i>
                Gestionar Usuarios
              </div>
            </Link>
            
            <Link 
              to="/admin/anuncios"
              style={{ textDecoration: 'none' }}
            >
              <div 
                style={{
                  ...tabStyle,
                  color: '#FF9800',
                  border: location.pathname === '/admin/anuncios' ? '2px solid #FF9800' : '1px solid #555',
                  backgroundColor: location.pathname === '/admin/anuncios' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                }}
              >
                <i className="fas fa-bullhorn" style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}></i>
                Anuncios
              </div>
            </Link>

            <Link 
              to="/admin/clientes"
              style={{ textDecoration: 'none' }}
            >
              <div 
                style={{
                  ...tabStyle,
                  color: '#FF9800',
                  border: location.pathname === '/admin/clientes' ? '2px solid #FF9800' : '1px solid #555',
                  backgroundColor: location.pathname === '/admin/clientes' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                }}
              >
                <i className="fas fa-address-book" style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}></i>
                Clientes
              </div>
            </Link>
          </div>
        </div>
      )}
      
      {/* Sección inferior con versión y copyright */}
      <div style={{ 
        padding: '15px', 
        borderTop: '1px solid #444', 
        marginTop: '30px',
        fontSize: '0.8rem',
        color: '#aaa',
        textAlign: 'center'
      }}>
        Mi Legado v1.0.0
      </div>
    </aside>
  );
}

export default Sidebar; 