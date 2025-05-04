import React from 'react';
import PlaylistItem from './PlaylistItem'; // Importar el item individual

function Playlist({ items, title = "Live grabados", onSelectVideo }) { // Título por defecto
  const containerStyle = {
    backgroundColor: '#353535',
    borderRadius: '8px',
    padding: '20px',
    height: 'calc(100% - 0px)', // Ajustar altura si es necesario, ejemplo 100%
    overflowY: 'auto', // Permitir scroll vertical
    display: 'flex',
    flexDirection: 'column'
    // Añadir estilos de scrollbar si se desea
  };

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '1.2em',
    color: 'white',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #444'
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>{title}</div>
      <div style={{ flexGrow: 1 }}> {/* Contenedor para los items que permita scroll */} 
        {items.map((item, index) => (
          <PlaylistItem key={item.id || index} item={item} onClick={() => onSelectVideo && onSelectVideo(item)} />
        ))}
      </div>
    </div>
  );
}

export default Playlist; 