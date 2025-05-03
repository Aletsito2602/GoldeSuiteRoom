import React from 'react';
import { Link } from 'react-router-dom';

// Recibe el estado isOpen como prop para controlar la visibilidad (opcional por ahora)
function Sidebar({ isOpen }) { 
  // Estilos base que no cambian con la animación
  const sidebarBaseStyle = {
    width: '250px', // Ancho fijo cuando está abierta
    background: '#353535', // Fondo oscuro para sidebar
    height: 'calc(100vh - 57px)', // Ajustar altura si el header cambió (aprox)
    borderRight: '1px solid #444', // Borde derecho más sutil
    color: 'rgba(255, 255, 255, 0.8)', // Color de texto base claro
    flexShrink: 0, // Evitar que se encoja si el contenido principal es muy grande
    // Quitar display: isOpen ? 'block' : 'none'
  };

  return (
    // Aplicar clase 'open' o 'closed' basado en isOpen
    // Mantener estilos base inline, la animación se hará con CSS
    <aside style={sidebarBaseStyle} className={isOpen ? 'sidebar open' : 'sidebar closed'}>
      <h2 style={{ color: 'white', borderBottom: '1px solid #555', paddingBottom: '10px' }}>Navegación</h2> {/* Título blanco */}
      <nav>
        <ul>
          {/* Enlaces principales como en Skool */}
          <li><Link style={{ color: '#D7B615' }} to="/">Comunidad</Link></li> {/* Enlaces dorados */} 
          <li><Link style={{ color: '#D7B615' }} to="/clases">Clases</Link></li> {/* Nueva ruta */} 
          <li><Link style={{ color: '#D7B615' }} to="/streaming">Streaming</Link></li> {/* Nueva ruta */} 
          {/* Añadir más enlaces: Calendario, Miembros, etc. */} 
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar; 