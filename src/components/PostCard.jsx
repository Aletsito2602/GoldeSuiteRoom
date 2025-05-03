import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

// Recibe los datos del post como props
function PostCard({ post }) {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  useEffect(() => {
    if (currentUser && post.likedBy?.includes(currentUser.uid)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
    setLikeCount(post.likes || 0);
  }, [post.likedBy, post.likes, currentUser]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("Debes iniciar sesión para dar Me Gusta.");
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

  const cardStyle = {
    backgroundColor: '#353535', // Fondo oscuro de la tarjeta
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    color: 'rgba(255, 255, 255, 0.87)'
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
    color: 'white',
    fontSize: '1em'
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
    <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={cardStyle} className="post-card">
        <div style={headerStyle} className="post-header">
          <img 
            src={post.authorAvatarUrl || 'https://placehold.co/45x45/777/FFF?text=A'} 
            alt={`${post.authorName || 'Autor'} avatar`} 
            style={avatarStyle} 
            className="avatar" 
          />
          <div>
            <div style={authorNameStyle} className="author-name">{post.authorName || 'Usuario Desconocido'}</div>
            <div style={authorInfoStyle} className="author-info">{post.time} | {post.category}</div>
          </div>
        </div>

        <div style={contentStyle}>
          {post.content.substring(0, 200)}{post.content.length > 200 && '...'}
        </div>

        <div style={footerStyle}>
          <span style={engagementStyle}>
            <button onClick={handleLike} style={likeButtonStyle}>
              <span style={iconStyle}>{isLiked ? '👍' : '👍'}</span>
            </button>
            <span style={{marginLeft: '5px'}}>{likeCount}</span>
          </span>
          <span style={engagementStyle}>
            <span style={iconStyle}>💬</span> {post.comments}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 