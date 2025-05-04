import React from 'react';

// Componente que ahora renderiza el embed de Vimeo o un video seleccionado
function VideoPlayer({ video }) {
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

  // Si hay un video seleccionado, mostrar ese video (Vimeo)
  if (video && video.id) {
    // Suponiendo que video.id es el ID de Vimeo
    const vimeoUrl = `https://player.vimeo.com/video/${video.id}`;
    return (
      <div style={containerStyle}>
        <iframe 
          src={vimeoUrl}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={iframeStyle}
          title={video.title || 'Video grabado'}
        ></iframe>
      </div>
    );
  }

  // Si no, mostrar el embed de streaming principal
  return (
    <div style={containerStyle}>
      <iframe 
        src="https://vimeo.com/event/5107021/embed/interaction" 
        frameBorder="0" 
        allow="autoplay; fullscreen; picture-in-picture" 
        allowFullScreen 
        style={iframeStyle}
        title="Vimeo Livestream"
      ></iframe>
    </div>
  );
}

export default VideoPlayer; 