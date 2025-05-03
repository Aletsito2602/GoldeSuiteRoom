import React from 'react';

function VideoInfo({ title, status }) {
  const containerStyle = {
    backgroundColor: '#353535',
    borderRadius: '8px',
    padding: '15px 20px',
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center'
  };

  const logoStyle = {
      width: '30px', // Tamaño del logo GSR
      height: '30px',
      borderRadius: '50%',
      backgroundColor: '#222', // Fondo para el logo
      marginRight: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: '#D7B615' // Letras doradas
  };

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '1.1em',
    color: 'white',
    flexGrow: 1, // Ocupar espacio
    marginRight: '15px'
  };

  const statusStyle = {
    fontSize: '0.9em',
    color: 'red', // Color rojo para "Live"
    display: 'flex',
    alignItems: 'center'
  };

  const liveDotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'red',
    marginRight: '5px'
  };

  return (
    <div style={containerStyle}>
      <div style={logoStyle}>G</div> {/* Placeholder Logo GSR */} 
      <span style={titleStyle}>{title}</span>
      {status === 'LIVE' && (
        <span style={statusStyle}>
          <span style={liveDotStyle}></span>
          LIVE EN VIVO
        </span>
      )}
      {/* Podríamos añadir otros estados aquí */}
    </div>
  );
}

export default VideoInfo; 