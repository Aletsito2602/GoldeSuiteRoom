import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Para obtener info del usuario

function PostInput({ onPostSubmit, isSubmitting }) {
  const { currentUser } = useAuth(); // Obtener usuario actual
  const [postContent, setPostContent] = useState(''); // <<< Estado para el input

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postContent.trim() || !currentUser) return; // No enviar si vacío o no logueado
    onPostSubmit(postContent); // <<< Llamar a la función del padre
    setPostContent(''); // Limpiar input después de enviar
  };

  const inputStyle = {
    backgroundColor: '#353535', // Fondo oscuro para el input
    border: '1px solid #444',
    borderRadius: '20px', // Bordes redondeados
    padding: '10px 15px',
    color: 'rgba(255, 255, 255, 0.7)',
    width: '100%', // Ocupar ancho disponible
    marginLeft: '10px' // Espacio después del avatar
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start', // Alinear al inicio para el botón
    padding: '15px 0',
    marginBottom: '20px',
    borderBottom: '1px solid #353535'
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%'
  };

  // <<< Estilo para el botón de publicar >>>
  const buttonStyle = {
      marginLeft: '10px',
      alignSelf: 'flex-end' // Alinear con el input
  };

  // Si no hay usuario, mostrar un mensaje o deshabilitar
  if (!currentUser) {
    return (
      <div style={containerStyle}>
        <p style={{color: 'rgba(255,255,255,0.6)', width: '100%', textAlign: 'center'}}>
            Inicia sesión para publicar.
        </p>
      </div>
    );
  }

  return (
    // <<< Usar form para el submit >>>
    <form onSubmit={handleSubmit} style={containerStyle}>
      <img 
        src={currentUser.photoURL || 'https://placehold.co/40x40/777/FFF?text=U'} // Usar avatar de Firebase si existe
        alt="User Avatar" 
        style={avatarStyle} 
      />
      <textarea // <<< Cambiar input a textarea para multi-línea
        placeholder="¿Qué estás pensando?" 
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        rows={3} // Ajustar filas según necesidad
        style={{...inputStyle, marginLeft: '10px'}} // Reaplicar estilo de input
        disabled={isSubmitting}
      />
      {/* Quitar iconos placeholder de búsqueda/filtro */}
      {/* <span style={{ ... }}>🔍</span> */}
      {/* <span style={{ ... }}>👤</span> */}
      
      {/* <<< Botón de Publicar >>> */}
      <button 
        type="submit" 
        style={buttonStyle} 
        disabled={!postContent.trim() || isSubmitting}
      >
        {isSubmitting ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
}

export default PostInput; 