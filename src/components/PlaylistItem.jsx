import React from 'react';

function PlaylistItem({ item, onClick }) {
  const itemStyle = {
    display: 'flex',
    marginBottom: '15px',
    cursor: 'pointer',
    backgroundColor: '#444', // Fondo ligeramente diferente para destacar
    borderRadius: '6px',
    overflow: 'hidden'
  };

  const thumbnailStyle = {
    width: '100px', // Ancho fijo para thumbnail
    height: '60px',
    flexShrink: 0,
    objectFit: 'cover',
    marginRight: '10px',
    position: 'relative' // Para botón de play
  };
  
  const playIconStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '1.5em',
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: '50%',
      padding: '5px'
  };

  const titleStyle = {
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.9)',
    // Podríamos limitar el número de líneas si es necesario
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2, // Limitar a 2 líneas
    WebkitBoxOrient: 'vertical' 
  };

  return (
    <div style={itemStyle} onClick={onClick}>
      <div style={{ position: 'relative' }}>
        <img 
          src={item.thumbnailUrl || 'https://placehold.co/100x60/555/ccc?text=Vid'} 
          alt={item.title} 
          style={thumbnailStyle} 
        />
        <span style={playIconStyle}>▶</span>
      </div>
      <div style={{ padding: '5px 0'}}> {/* Añadir padding vertical pequeño */}
          <span style={titleStyle}>{item.title}</span>
      </div>
    </div>
  );
}

export default PlaylistItem;