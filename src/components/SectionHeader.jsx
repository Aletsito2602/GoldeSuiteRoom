import React from 'react';

function SectionHeader({ title, children }) {
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #353535'
  };

  const titleStyle = {
    fontSize: '1.1em',
    fontWeight: 'normal',
    color: 'rgba(255, 255, 255, 0.8)'
    // Podríamos añadir el icono de libro aquí
  };

  const filterButtonStyle = {
    backgroundColor: '#353535',
    border: '1px solid #555',
    borderRadius: '50%', // Botón redondo
    color: '#D7B615', // Icono dorado
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };

  return (
    <div style={headerStyle}>
      <span style={titleStyle}>📚 {title}</span> {/* Icono de libro añadido */} 
      <button style={filterButtonStyle}>
        {/* Placeholder para el icono de filtro */} ||| 
      </button>
    </div>
  );
}

export default SectionHeader; 