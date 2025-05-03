import React from 'react';

// Componente que ahora renderiza el embed de Vimeo
function VideoPlayer() { 
  // Ya no necesitamos el playerStyle anterior

  // Estilos para el contenedor que mantiene el aspect ratio 16:9
  const containerStyle = {
    padding: '56.25% 0 0 0', // Padding-top para 16:9 (9 / 16 * 100)
    position: 'relative',
    backgroundColor: '#000', // Mantener fondo negro por si el iframe tarda en cargar
    borderRadius: '15px', // Añadir borde redondeado
    overflow: 'hidden' // Ocultar lo que sobresale del iframe
  };

  // Estilos para el iframe
  const iframeStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    border: 'none' // Asegurarse que el iframe no tenga borde propio
  };

  return (
    <div style={containerStyle}>
      <iframe 
        src="https://vimeo.com/event/5107021/embed/interaction" 
        frameBorder="0" 
        allow="autoplay; fullscreen; picture-in-picture" 
        allowFullScreen 
        style={iframeStyle}
        title="Vimeo Livestream" // Añadir título para accesibilidad
      ></iframe>
    </div>
  );
}

export default VideoPlayer; 