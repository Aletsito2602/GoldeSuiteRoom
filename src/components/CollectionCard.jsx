import React from 'react';

function CollectionCard({ collection }) {
  const cardStyle = {
    backgroundColor: '#353535',
    borderRadius: '8px',
    padding: '20px',
    marginRight: '15px', // Espacio entre tarjetas
    marginBottom: '15px',
    minWidth: '180px', // Ancho mínimo
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer'
  };

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '1.1em',
    color: 'white',
    marginBottom: '5px'
  };

  const countStyle = {
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '15px'
  };

  const iconStyle = {
    fontSize: '2em', // Tamaño del icono
    color: '#D7B615' // Color dorado para icono
  };

  return (
    <div style={cardStyle}>
      <div>
        <div style={titleStyle}>{collection.title}</div>
        <div style={countStyle}>{collection.count} clases</div>
      </div>
      <div style={iconStyle}>
        {/* Placeholder para el icono específico */} {collection.icon || '💡'} 
      </div>
    </div>
  );
}

export default CollectionCard; 