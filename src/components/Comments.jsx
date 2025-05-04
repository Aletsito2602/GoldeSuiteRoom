import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; // <<< Importar db y auth
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore"; // <<< Importar más funciones Firestore
import { useAuth } from '../context/AuthContext'; // <<< Importar useAuth

// Recibir postId como prop
function Comments({ postId }) { 
  const { currentUser } = useAuth(); // Obtener usuario logueado
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorComments, setErrorComments] = useState(null);
  const [indexBuilding, setIndexBuilding] = useState(false); // Estado para índice en construcción
  const [newComment, setNewComment] = useState(''); // Estado para el input
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect para escuchar comentarios en tiempo real
  useEffect(() => {
    if (!postId) return; // No hacer nada si no hay postId

    setLoadingComments(true);
    setErrorComments(null);
    setIndexBuilding(false);

    const commentsRef = collection(db, "comments");
    // Crear query: comentarios para este postId, ordenados por fecha
    const q = query(commentsRef, where("postId", "==", postId), orderBy("createdAt", "asc"));

    // Escuchar cambios con onSnapshot
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments = [];
      querySnapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() });
      });
      setComments(fetchedComments);
      setLoadingComments(false);
    }, (error) => { // Manejo de error del listener
      console.error("Error listening to comments: ", error);
      
      // Verificar si el error es de índice en construcción
      if (error.message && error.message.includes("index")) {
        setIndexBuilding(true);
        setErrorComments("Los comentarios están siendo preparados. Por favor, espera unos minutos.");
      } else {
        setErrorComments("No se pudieron cargar los comentarios.");
      }
      
      setLoadingComments(false);
    });

    // Limpiar el listener al desmontar o si cambia el postId
    return () => unsubscribe();
  }, [postId]);

  // <<< Función para enviar nuevo comentario >>>
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return; // No enviar comentarios vacíos
    if (!currentUser) {
        alert("Debes iniciar sesión para comentar."); // O redirigir a login
        return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        postId: postId,
        text: newComment,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email, // Usar displayName o email
        authorAvatarUrl: currentUser.photoURL || '', // Usar photoURL si existe
        createdAt: serverTimestamp() // Usar timestamp del servidor
      });
      setNewComment(''); // Limpiar input
    } catch (error) {
      console.error("Error adding comment: ", error);
      alert("Hubo un error al enviar tu comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // <<< Función para formatear Timestamps (igual que en otras páginas) >>>
  const formatFirestoreTimestamp = (timestamp) => {
      if (!timestamp) return '...'; // Mostrar algo mientras carga
      const date = timestamp.toDate(); 
      // ... (lógica de formateo) ...
      return "hace X tiempo"; // Implementar lógica completa
  };

  const containerStyle = {
    backgroundColor: '#353535', 
    borderRadius: '8px',
    padding: '20px',
    height: '100%', // Intentar ocupar altura disponible
    display: 'flex',
    flexDirection: 'column'
  };

  const titleStyle = {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #444'
  };

  const commentListStyle = {
      flexGrow: 1, // Ocupa espacio restante
      overflowY: 'auto', // Scroll si hay muchos comentarios
      marginBottom: '15px'
  };

  const commentItemStyle = {
      display: 'flex',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '1px solid #444'
  };

  const commentAvatarStyle = {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      marginRight: '10px',
      flexShrink: 0
  };
  
  const commentTextStyle = {
      fontSize: '0.9em',
      color: 'rgba(255, 255, 255, 0.85)',
      lineHeight: 1.4
  };
  
  const commentAuthorStyle = {
      fontWeight: 'bold',
      color: 'white',
      fontSize: '0.95em',
      marginRight: '8px'
  };
  
  const commentTimeStyle = {
      fontSize: '0.8em',
      color: 'rgba(255, 255, 255, 0.6)'
  };

  const inputAreaStyle = {
    display: 'flex',
    marginTop: 'auto' // Empujar al fondo
  };

  const textareaStyle = {
    flexGrow: 1,
    backgroundColor: '#444',
    border: '1px solid #555',
    borderRadius: '5px',
    padding: '10px',
    color: 'white',
    marginRight: '10px',
    resize: 'none' // Evitar que se pueda redimensionar
  };

  const buttonStyle = {
    // Hereda estilos de botón de index.css
    alignSelf: 'flex-end' // Alinear con la parte inferior del textarea
  };

  const indexBuildingStyle = {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid rgba(255, 165, 0, 0.5)',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '15px',
    color: 'rgba(255, 165, 0, 0.9)'
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Comentarios ({comments.length})</div>
      
      {indexBuilding && (
        <div style={indexBuildingStyle}>
          <p>⚠️ Estamos preparando el sistema de comentarios. Esta operación puede tardar unos minutos.</p>
          <p>Por favor, vuelve a intentarlo más tarde.</p>
        </div>
      )}
      
      <div style={commentListStyle}>
        {loadingComments && <p>Cargando comentarios...</p>}
        {errorComments && !indexBuilding && <p style={{ color: 'red' }}>{errorComments}</p>}
        {!loadingComments && !errorComments && comments.length === 0 && <p style={{color: 'rgba(255,255,255,0.6)'}}>Sé el primero en comentar.</p>}
        {!loadingComments && !errorComments && comments.map(comment => (
          <div key={comment.id} style={commentItemStyle}>
            <img src={comment.authorAvatarUrl || 'https://placehold.co/30x30/bbb/FFF?text=A'} alt={comment.authorName} style={commentAvatarStyle} />
            <div>
                <div>
                    <span style={commentAuthorStyle}>{comment.authorName}</span>
                    <span style={commentTimeStyle}>{formatFirestoreTimestamp(comment.createdAt)}</span>
                </div>
                <p style={commentTextStyle}>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleCommentSubmit} style={inputAreaStyle}>
        <textarea 
          rows="3" 
          placeholder={currentUser ? "Escribe tu comentario..." : "Inicia sesión para comentar"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!currentUser || isSubmitting || indexBuilding} // Deshabilitar si no logueado, enviando o índice en construcción
          style={textareaStyle}
        />
        <button type="submit" disabled={!currentUser || !newComment.trim() || isSubmitting || indexBuilding} style={buttonStyle}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default Comments; 