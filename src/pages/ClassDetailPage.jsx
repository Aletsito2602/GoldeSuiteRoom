import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Comments from '../components/Comments';

function ClassDetailPage() {
  const { classId } = useParams(); // Obtener el ID de la URL
  const [videoDetails, setVideoDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/vimeo/video/${classId}`);
        
        if (!response.ok) {
          let errorMsg = `Error HTTP: ${response.status} ${response.statusText}`;
          try {
             const errorBody = await response.text();
             if (errorBody.trim().startsWith('<!DOCTYPE') || errorBody.trim().startsWith('<html>')) {
                 errorMsg += " (Respuesta recibida no es JSON, parece HTML)";
             } else {
                 errorMsg += `: ${errorBody}`; 
             }
          } catch (parseError) {
          }
          throw new Error(errorMsg);
        }
        
        const data = await response.json();
        setVideoDetails(data);
      } catch (err) {
        console.error("Error fetching video details:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (classId) {
      fetchVideoDetails();
    }
  }, [classId]); // Volver a ejecutar si classId cambia

  // Estilo para el reproductor (ya existía, pero iframeStyle se usará ahora directamente)
  const embedContainerStyle = {
    padding: '56.25% 0 0 0',
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: '15px',
    overflow: 'hidden',
    marginBottom: '20px'
  };
  const embedIframeStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    border: 'none'
  };

  // Construir la URL del reproductor de Vimeo
  const vimeoPlayerUrl = `https://player.vimeo.com/video/${classId}?autoplay=0&title=0&byline=0&portrait=0`; // Quitamos autoplay por defecto, añadimos otros params para limpiar

  if (isLoading) {
    return <div>Cargando detalles de la clase...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error al cargar la clase: {error}</div>;
  }

  if (!videoDetails) {
    return <div>No se encontraron detalles para esta clase.</div>;
  }

  return (
    <div>
      {/* Enlace para volver a la lista de clases */}
      <Link to="/" style={{ color: '#D7B615', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Volver a Clases
      </Link>

      {/* <<< Usar clases CSS para el layout >>> */}
      <div className="page-layout-columns">
        {/* Columna Izquierda */}
        <div className="left-column">
          {/* <<< Renderizar iframe manualmente */}
          <div style={embedContainerStyle}> 
            <iframe
              src={vimeoPlayerUrl} 
              style={embedIframeStyle}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={videoDetails?.name || 'Vimeo Video'} // Usar título del video si está disponible
            ></iframe>
          </div>
          
          {/* Información del video */}
          {videoDetails && (
            <>
              <h1 style={{ color: 'white', marginTop: '10px' }}>{videoDetails.name}</h1>
              {videoDetails.description && (
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                  {videoDetails.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Columna Derecha */}
        <div className="right-column">
          <Comments />
        </div>
      </div>
    </div>
  );
}

export default ClassDetailPage; 