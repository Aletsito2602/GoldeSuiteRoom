import React from 'react';
import { Link } from 'react-router-dom';

function ClassCard({ classInfo }) {
  const cardStyle = {
    backgroundColor: '#353535',
    borderRadius: '8px',
    marginBottom: '20px',
    overflow: 'hidden', // Para que el borde redondeado afecte a la imagen
    display: 'flex', // Usar flex para imagen y contenido
    color: 'rgba(255, 255, 255, 0.87)'
  };

  const thumbnailContainerStyle = {
    flexShrink: 0, // Evitar que la imagen se encoja
    width: '40%', // Ancho relativo para la imagen
    position: 'relative', // Para posicionar iconos sobre la imagen
    cursor: 'pointer'
  };

  const thumbnailStyle = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover' // Ajustar imagen
  };
  
  const playButtonStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      color: '#222',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5em',
      border: 'none'
  };

  const heartIconStyle = {
      position: 'absolute',
      top: '10px',
      right: '10px',
      color: 'white', // Cambiar color si es favorito
      fontSize: '1.5em',
      cursor: 'pointer'
  };

  const contentStyle = {
    padding: '20px',
    flexGrow: 1, // Ocupar espacio restante
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between' // Espacio entre título/progreso y descarga
  };

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '1.2em',
    color: 'white',
    marginBottom: '5px'
  };

  const durationStyle = {
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '15px'
  };

  const progressContainerStyle = {
    backgroundColor: '#555',
    borderRadius: '5px',
    height: '8px',
    overflow: 'hidden',
    marginBottom: '5px'
  };

  const progressBarStyle = {
    backgroundColor: '#D7B615', // Color dorado para progreso
    height: '100%',
    width: `${classInfo.progress || 0}%` // Ancho basado en progreso
  };
  
  const progressTextStyle = {
      fontSize: '0.8em',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '15px'
  };

  const downloadIconStyle = {
    alignSelf: 'flex-end', // Alinear icono a la derecha
    color: '#aaa',
    border: '1px solid #555',
    borderRadius: '50%',
    padding: '5px',
    cursor: 'pointer',
    fontSize: '1.2em'
  };

  return (
    <Link to={`/clases/${classInfo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={cardStyle} className="class-card">
        <div style={thumbnailContainerStyle} className="thumbnail-container">
          <img 
            src={classInfo.thumbnailUrl || 'https://placehold.co/600x400/444/ccc?text=Clase'}
            alt={classInfo.title} 
            style={thumbnailStyle} 
          />
          <span style={heartIconStyle}>♡</span>
        </div>
        <div style={contentStyle} className="class-content">
          <div>
            <div style={titleStyle} className="class-title">{classInfo.title}</div>
            <div style={durationStyle} className="class-duration">{classInfo.duration}</div>
            <div style={progressContainerStyle}>
              <div style={progressBarStyle}></div>
            </div>
            <div style={progressTextStyle} className="progress-text">{classInfo.progress || 0}% completado</div>
          </div>
          <span style={downloadIconStyle} className="download-icon">↓</span>
        </div>
      </div>
    </Link>
  );
}

export default ClassCard; 