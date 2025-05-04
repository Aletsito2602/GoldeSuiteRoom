import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

// Recibe los datos del post como props
function PostCard({ post }) {
  const { currentUser } = useAuth();
  // Protección contra post mal formados
  const safePost = {
    id: post?.id || 'unknown',
    content: post?.content || '',
    authorName: post?.authorName || 'Usuario Desconocido',
    authorAvatarUrl: post?.authorAvatarUrl || '',
    category: post?.category || 'General',
    likes: post?.likes || 0,
    comments: post?.commentCount || 0,
    likedBy: post?.likedBy || [],
    createdAt: post?.createdAt || null
  };
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(safePost.likes);

  useEffect(() => {
    if (currentUser && safePost.likedBy.includes(currentUser.uid)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
    setLikeCount(safePost.likes);
  }, [safePost.likedBy, safePost.likes, currentUser]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("Debes iniciar sesión para dar Me Gusta.");
      return;
    }

    if (!post.id) {
      console.error("Post ID missing");
      return;
    }

    const postRef = doc(db, "posts", post.id);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error updating like: ", error);
      alert("Error al actualizar el Me Gusta.");
    }
  };

  // Crear un tiempo para mostrar basado en createdAt
  const getTimeString = () => {
    if (!safePost.createdAt) return 'Fecha desconocida';
    
    try {
      // Verificar si es un objeto Firestore Timestamp
      if (safePost.createdAt.toDate) {
        const date = safePost.createdAt.toDate();
        // Formato simple
        return date.toLocaleDateString();
      } else if (safePost.createdAt.seconds) {
        // Otro formato de timestamp
        const date = new Date(safePost.createdAt.seconds * 1000);
        return date.toLocaleDateString();
      }
      return 'Fecha reciente';
    } catch (e) {
      console.error("Error parsing date:", e);
      return 'Fecha desconocida';
    }
  };

  const cardStyle = {
    background: 'linear-gradient(to bottom, #222222, #3C3C3C)',
    borderRadius: '30px',
    padding: '20px',
    marginBottom: '20px',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #3C3C3C'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px'
  };

  const avatarStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    marginRight: '15px'
  };

  const authorInfoStyle = {
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.7)'
  };

  const authorNameStyle = {
    fontWeight: 'bold',
    fontSize: '1em',
    background: 'linear-gradient(to right, #FFFFFF, #AAAAAA)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  };
  
  const contentStyle = {
    lineHeight: '1.6',
    marginBottom: '15px',
    overflow: 'hidden',
    maxHeight: '7em'
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.6)'
  };

  const iconStyle = {
    marginRight: '5px'
  };

  const engagementStyle = {
    marginRight: '20px', 
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  };

  const likeButtonStyle = { 
    background: 'none', 
    border: 'none', 
    padding: 0, 
    margin: 0, 
    cursor: 'pointer', 
    color: isLiked ? '#D7B615' : 'inherit'
  };

  return (
    <Link to={`/post/${safePost.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={cardStyle} className="post-card">
        <div style={headerStyle} className="post-header">
          <img 
            src={safePost.authorAvatarUrl || 'https://placehold.co/45x45/777/FFF?text=A'} 
            alt={`${safePost.authorName} avatar`} 
            style={avatarStyle} 
            className="avatar" 
          />
          <div>
            <div style={authorNameStyle} className="author-name">{safePost.authorName}</div>
            <div style={authorInfoStyle} className="author-info">{getTimeString()} | {safePost.category}</div>
          </div>
        </div>

        <div style={contentStyle}>
          {safePost.content ? (
            <>
              {safePost.content.substring(0, 200)}
              {safePost.content.length > 200 && '...'}
            </>
          ) : (
            <i>Sin contenido</i>
          )}
        </div>

        <div style={footerStyle}>
          <span style={engagementStyle}>
            <button onClick={handleLike} style={likeButtonStyle}>
              <span style={iconStyle}>{isLiked ? '👍' : '👍'}</span>
            </button>
            <span style={{marginLeft: '5px'}}>{likeCount}</span>
          </span>
          <span style={engagementStyle}>
            <span style={iconStyle}>💬</span> {safePost.comments}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 