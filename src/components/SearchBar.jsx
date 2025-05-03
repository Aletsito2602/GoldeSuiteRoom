import React from 'react';

// Componente más genérico para búsqueda
function SearchBar({ placeholder = "Buscar..." }) { // Añadir placeholder por defecto
  const inputStyle = {
    backgroundColor: '#353535', 
    border: '1px solid #444',
    borderRadius: '20px', 
    padding: '10px 15px',
    color: 'rgba(255, 255, 255, 0.7)',
    width: '100%', 
    marginLeft: '10px' 
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    marginBottom: '20px' // Quitar borde inferior de PostInput
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%'
  };

  return (
    <div style={containerStyle}>
      {/* Avatar del usuario (como en la imagen) */}
      <img 
        src="https://placehold.co/40x40/777/FFF?text=U" 
        alt="User Avatar" 
        style={avatarStyle} 
      />
      <input 
        type="text" 
        placeholder={placeholder} 
        style={inputStyle} 
      />
      {/* Iconos de búsqueda y filtro (placeholders) */}
      <span style={{ marginLeft: '15px', color: '#aaa', cursor: 'pointer' }}>🔍</span>
      <span style={{ marginLeft: '10px', color: '#aaa', cursor: 'pointer' }}>👤</span>
    </div>
  );
}

export default SearchBar; 