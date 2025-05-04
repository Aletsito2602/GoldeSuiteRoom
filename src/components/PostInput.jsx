import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Para obtener info del usuario

function PostInput({ onSubmitPost, isSubmitting, selectedCategory }) {
  const { currentUser } = useAuth(); // Obtener usuario actual
  const [postContent, setPostContent] = useState(''); // <<< Estado para el input

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postContent.trim() || !currentUser) return; // No enviar si vacío o no logueado
    onSubmitPost(postContent); // Llamar a la función del padre con el contenido correcto
    setPostContent(''); // Limpiar input después de enviar
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '15px 0',
    marginBottom: '20px',
    borderBottom: '1px solid #353535',
    gap: '12px' // Añadir espacio entre elementos
  };

  const inputStyle = {
    backgroundColor: '#353535',
    border: '1px solid #444',
    borderRadius: '20px',
    padding: '12px 15px',
    color: 'rgba(255, 255, 255, 0.7)',
    width: '100%'
  };

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#D7B615',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    border: '2px solid #555',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  // <<< Estilo para el botón de publicar >>>
  const buttonStyle = {
    marginLeft: '10px',
    alignSelf: 'flex-end',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#D7B615',
    color: '#222',
    border: 'none',
    fontWeight: 'bold',
    cursor: postContent.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
    opacity: postContent.trim() && !isSubmitting ? 1 : 0.7
  };

  // Mostrar la categoría seleccionada junto al input
  const categoryStyle = {
    fontSize: '0.8rem',
    color: selectedCategory === 'Anuncios' ? '#FF9800' : '#D7B615',
    marginLeft: '50px',
    marginBottom: '5px'
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

  // Obtener la primera letra del nombre si existe
  const getUserInitial = () => {
    if (currentUser.displayName && currentUser.displayName.trim() !== '') {
      return currentUser.displayName.trim()[0].toUpperCase();
    }
    return currentUser.email ? currentUser.email[0].toUpperCase() : 'U';
  };

  return (
    <div>
      {selectedCategory && (
        <div style={categoryStyle}>
          Publicando en: {selectedCategory}
        </div>
      )}
      <form onSubmit={handleSubmit} style={containerStyle}>
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt="User Avatar" 
            style={avatarStyle} 
          />
        ) : (
          <div style={avatarStyle}>
            {getUserInitial()}
          </div>
        )}
        <textarea
          placeholder={selectedCategory === 'Anuncios' ? "Escribe un anuncio importante..." : "¿Qué estás pensando?"} 
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          rows={3}
          style={inputStyle}
          disabled={isSubmitting}
        />
        
        <button 
          type="submit" 
          style={buttonStyle}
          disabled={!postContent.trim() || isSubmitting}
        >
          {isSubmitting ? 'Publicando...' : selectedCategory === 'Anuncios' ? 'Publicar Anuncio' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}

export default PostInput; 