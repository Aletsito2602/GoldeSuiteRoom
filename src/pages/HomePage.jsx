import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebaseConfig'; // Importamos storage 
import { collection, query, orderBy, getDocs, Timestamp, addDoc, serverTimestamp, where, doc, setDoc } from "firebase/firestore";
import { useAuth } from '../context/AuthContext'; 
import { isUserAdmin } from '../utils/authUtils';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importamos funciones para storage
import { updateProfile } from 'firebase/auth'; // Importamos updateProfile para actualizar el perfil
// Importar los nuevos componentes
import PostInput from '../components/PostInput';
import FilterButtons from '../components/FilterButtons';
import PostCard from '../components/PostCard';
import AnunciosList from '../components/AnunciosList'; // Importar componente de anuncios
// Importar componentes de Streaming
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import VideoPlayer from '../components/VideoPlayer';
import VideoInfo from '../components/VideoInfo';
import Playlist from '../components/Playlist';

// Componente para el perfil de usuario (separado para mejor organización)
function UserProfile({ currentUser }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(currentUser?.photoURL || '');
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Efecto para actualizar campos si cambia currentUser
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPreviewURL(currentUser.photoURL || '');
    }
  }, [currentUser]);
  
  // Efecto para detectar cambios
  useEffect(() => {
    if (currentUser) {
      const nameChanged = displayName !== (currentUser.displayName || '');
      const photoChanged = selectedFile !== null;
      setHasChanges(nameChanged || photoChanged);
    }
  }, [displayName, selectedFile, currentUser]);
  
  // Manejar cambio de nombre
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setDisplayName(newName);
    setHasChanges(newName !== (currentUser?.displayName || '') || selectedFile !== null);
  };
  
  // Manejar cambio de foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Crear URL de vista previa
      const fileURL = URL.createObjectURL(file);
      setPreviewURL(fileURL);
      setHasChanges(true);
    }
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    if (!hasChanges || !currentUser) return;
    
    setIsUploading(true);
    try {
      let photoURL = currentUser.photoURL || '';
      
      // Si hay un archivo seleccionado, subirlo a Firebase Storage
      if (selectedFile) {
        try {
          // Crear una referencia única usando el UID del usuario y timestamp
          const storageRef = ref(storage, `profile_pictures/${currentUser.uid}_${Date.now()}`);
          
          // Subir el archivo
          await uploadBytes(storageRef, selectedFile);
          
          // Obtener la URL de descarga
          photoURL = await getDownloadURL(storageRef);
          console.log('Nueva URL de foto:', photoURL);
        } catch (error) {
          console.error('Error al subir imagen:', error);
          throw new Error('Error al subir la imagen: ' + error.message);
        }
      }
      
      // Actualizar el perfil del usuario en Firebase Auth
      try {
        console.log('Actualizando perfil con:', {
          displayName: displayName.trim(),
          photoURL: photoURL
        });
        
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
          photoURL: photoURL
        });
        
        console.log('Perfil actualizado en Auth correctamente');
      } catch (error) {
        console.error('Error al actualizar perfil en Auth:', error);
        throw new Error('Error al actualizar perfil: ' + error.message);
      }
      
      // Actualizar el perfil en Firestore
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          displayName: displayName.trim(),
          photoURL: photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log('Perfil actualizado en Firestore correctamente');
      } catch (error) {
        console.error('Error al actualizar perfil en Firestore:', error);
        throw new Error('Error al guardar en la base de datos: ' + error.message);
      }
      
      // Limpiar el estado y mostrar mensaje de éxito
      setSelectedFile(null);
      setHasChanges(false);
      alert('Perfil actualizado con éxito');
      
      // Recargar la página para mostrar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Ocurrió un error al actualizar el perfil: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '30px' }}>
      {/* Sección de foto de perfil */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          border: '2px solid #D7B615',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '10px',
          backgroundColor: '#444'
        }}>
          {previewURL ? (
            <img 
              src={previewURL} 
              alt="Foto de perfil" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '100%', 
              height: '100%',
              fontSize: '3rem',
              color: '#D7B615'
            }}>
              {displayName ? displayName[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <input 
          type="file" 
          id="profilePictureInput" 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange} 
        />
        <label 
          htmlFor="profilePictureInput"
          style={{
            padding: '8px 12px',
            backgroundColor: '#666',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-block',
            fontSize: '0.9rem'
          }}
        >
          Cambiar foto
        </label>
      </div>
      
      {/* Información básica */}
      <div style={{ flex: 1 }}>
        <h2 style={{ color: '#D7B615', marginBottom: '15px' }}>Información Personal</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>
            Nombre completo
          </label>
          <input 
            type="text" 
            value={displayName} 
            onChange={handleNameChange}
            placeholder="Tu nombre completo"
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '8px 12px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>
            Correo electrónico
          </label>
          <input 
            type="email" 
            value={currentUser.email} 
            disabled
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '8px 12px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.5)'
            }}
          />
          <small style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '5px' }}>
            El correo no se puede modificar
          </small>
        </div>

        {/* Botón para guardar cambios */}
        <button
          onClick={handleSaveChanges}
          disabled={!hasChanges || isUploading}
          style={{
            padding: '12px 24px',
            backgroundColor: hasChanges ? '#D7B615' : '#666',
            color: hasChanges ? '#222' : '#999',
            border: 'none',
            borderRadius: '4px',
            cursor: hasChanges && !isUploading ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            marginTop: '20px',
            width: '100%',
            maxWidth: '300px',
            display: 'block'
          }}
        >
          {isUploading ? (
            <span>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Guardando...
            </span>
          ) : (
            <span>
              <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
              Guardar Cambios
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// Datos de ejemplo Streaming Playlist
const samplePlaylistItems = [
  { id: 'pl1', title: 'El camino al éxito financiero: Domina el arte del trading', thumbnailUrl: 'https://placehold.co/100x60/777/eee?text=Chart1' },
  { id: 'pl2', title: 'De novato a experto: Aprende a realizar inversiones exitosas', thumbnailUrl: 'https://placehold.co/100x60/666/eee?text=Chart2' },
  { id: 'pl3', title: 'Optimiza tu trading: Técnicas clave para mejores resultados', thumbnailUrl: 'https://placehold.co/100x60/555/eee?text=Isaac1' },
  { id: 'pl4', title: 'Aprende con nosotros', thumbnailUrl: 'https://placehold.co/100x60/444/eee?text=Chart3' },
  { id: 'pl5', title: 'Secretos del análisis técnico', thumbnailUrl: 'https://placehold.co/100x60/333/eee?text=Chart4' },
  // Añadir más items
];

function HomePage() {
  const { currentUser } = useAuth(); // <<< Obtener usuario actual
  const location = useLocation(); // Para leer parámetros de URL
  const navigate = useNavigate(); // Para actualizar la URL sin recargar
  
  // Leer el parámetro 'tab' de la URL o usar 'comunidad' por defecto
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    return tabParam || 'comunidad';
  };
  
  // Estado para la pestaña activa, inicializada desde la URL
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Escuchar cambios en la URL para actualizar la pestaña activa
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.search]);

  // <<< NUEVO ESTADO para posts >>>
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false); // <<< Estado para submit
  
  // <<< NUEVOS ESTADOS para Streaming >>>
  const [streamingPlaylistVideos, setStreamingPlaylistVideos] = useState([]); 
  const [streamingSelectedVideo, setStreamingSelectedVideo] = useState(null);
  const [isLoadingStreaming, setIsLoadingStreaming] = useState(false);
  const [errorStreaming, setErrorStreaming] = useState(null);
  
  // Nuevo estado para la categoría activa
  const [activeCategory, setActiveCategory] = useState('General');
  
  // Nuevo estado para verificar si el usuario es admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si el usuario es administrador al cargar y cuando cambie currentUser
  useEffect(() => {
    const checkIfAdmin = async () => {
      if (currentUser) {
        try {
          // Usar la función isUserAdmin de authUtils para verificar el rol admin
          const adminStatus = await isUserAdmin(currentUser.uid);
          console.log("¿Es admin?:", adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error verificando permisos de administrador:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkIfAdmin();
  }, [currentUser]);

  // <<< useEffect para cargar videos de la Playlist de Streaming >>>
  useEffect(() => {
    if (activeTab === 'streaming' && streamingPlaylistVideos.length === 0) {
      const fetchStreamingPlaylist = async () => {
        setIsLoadingStreaming(true);
        setErrorStreaming(null);
        const streamingFolderId = '25173287'; // ID de la carpeta de streaming
        try {
          // Llamada al backend con el folderId como query param
          const response = await fetch(`http://localhost:3001/api/vimeo/folder-videos?folderId=${streamingFolderId}`); 
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          const data = await response.json();
          
          console.log("Datos recibidos para Playlist Streaming:", data);
          
          // Mapeo similar al de Clases, adaptado a lo que necesita Playlist/PlaylistItem
          const formattedData = data.map(video => {
            let thumbnailUrl = 'https://placehold.co/100x60/333/ccc?text=Video'; // Placeholder específico playlist
            if (video.pictures?.sizes) {
              // Buscar miniatura pequeña para playlist (~100-200px)
              const suitableSize = video.pictures.sizes.find(size => size.width >= 100 && size.width <= 200);
              const chosenSize = suitableSize || video.pictures.sizes[0]; // Tomar la más pequeña si no
              if (chosenSize) {
                thumbnailUrl = chosenSize.link;
              }
            }
            const videoId = video.uri?.split('/').pop();
            return {
              id: videoId || video.link, // ID para navegación o key
              title: video.name || 'Video sin título',
              thumbnailUrl: thumbnailUrl // URL de la miniatura
              // Añadir más campos si Playlist/PlaylistItem los necesita (ej. duration)
            };
          });
          setStreamingPlaylistVideos(formattedData);
        } catch (error) {
          console.error("Error fetching streaming playlist videos:", error);
          setErrorStreaming(error.message);
        } finally {
          setIsLoadingStreaming(false);
        }
      };
      fetchStreamingPlaylist();
    }
  }, [activeTab, streamingPlaylistVideos.length]);

  // Modificar fetchPosts para filtrar por categoría
  const fetchPosts = async () => {
      setLoadingPosts(true);
      setErrorPosts(null);
      try {
          const postsRef = collection(db, "posts");
          let postsQuery;
          
          // Siempre ordenamos por fecha de creación descendente
          postsQuery = query(postsRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(postsQuery);
          const fetchedPosts = [];
          
          querySnapshot.forEach((doc) => {
              const postData = doc.data();
              
              // Aplicar lógica de filtrado según la categoría activa
              if (activeCategory === 'General') {
                  // Para "General", incluir posts sin categoría o con category='General'
                  if (!postData.category || postData.category === 'General') {
                      fetchedPosts.push({ id: doc.id, ...postData });
                  }
              } else if (activeCategory === 'Anuncios') {
                  // Para "Anuncios", solo incluir posts con category='Anuncios'
                  if (postData.category === 'Anuncios') {
                      fetchedPosts.push({ id: doc.id, ...postData });
                  }
              } else {
                  // Si no hay filtro activo o es otra categoría, incluir todos
                  fetchedPosts.push({ id: doc.id, ...postData });
              }
          });
          
          setPosts(fetchedPosts);
      } catch (err) {
          console.error("Error fetching posts:", err);
          setErrorPosts("No se pudieron cargar las publicaciones.");
      } finally {
          setLoadingPosts(false);
      }
  };

  // useEffect para cargar posts cuando cambie la categoría activa
  useEffect(() => {
    if (activeTab === 'comunidad') {
      fetchPosts(); 
    }
  }, [activeTab, activeCategory]); 

  // <<< Función para formatear Timestamps (opcional pero útil) >>>
  const formatFirestoreTimestamp = (timestamp) => {
      if (!timestamp) return 'Hace un momento';
      // Asumiendo que timestamp es un objeto Timestamp de Firestore
      const date = timestamp.toDate(); 
      // Lógica simple de tiempo relativo (se puede mejorar con librerías como date-fns)
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " años";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " meses";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " días";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " min";
      return "Hace un momento";
  };

  // Modificar la función handlePostSubmit para incluir la categoría
  const handlePostSubmit = async (content) => {
      if (!currentUser) return; // Doble chequeo
      
      console.log("Intentando publicar en categoría:", activeCategory);
      console.log("¿Usuario es admin?:", isAdmin);
      
      // Verificar si el usuario puede publicar en esta categoría
      if (activeCategory === 'Anuncios' && !isAdmin) {
          alert("Solo los administradores pueden publicar anuncios.");
          return;
      }
      
      // Validar que content no sea vacío o undefined
      const postContent = content || '';
      if (postContent.trim() === '') {
          alert("El contenido de la publicación no puede estar vacío.");
          return;
      }
      
      setIsSubmittingPost(true);
      try {
          await addDoc(collection(db, "posts"), {
              content: postContent,
              authorUid: currentUser.uid,
              authorName: currentUser.displayName || currentUser.email,
              authorAvatarUrl: currentUser.photoURL || '',
              category: activeCategory, // Usar la categoría activa
              createdAt: serverTimestamp(),
              likes: 0,
              commentCount: 0,
              likedBy: []
          });
          console.log("Publicación creada exitosamente en categoría:", activeCategory);
          fetchPosts(); 
      } catch (error) {
          console.error("Error adding post: ", error);
          setErrorPosts("Error al publicar."); // Mostrar error en la lista
      } finally {
          setIsSubmittingPost(false);
      }
  };

  // Manejar el cambio de categoría
  const handleCategoryChange = (newCategory) => {
    console.log("Cambiando a categoría:", newCategory);
    setActiveCategory(newCategory);
  };

  return (
    <div className="home-page">
      {/* Selector de pestañas con enlaces de React Router en lugar de botones */}
      <div className="tabs-container" style={{
        display: 'flex',
        justifyContent: 'flex-start',
        margin: '15px 0 25px',
        gap: '15px',
        padding: '0 10px',
        overflowX: 'auto'
      }}>
        <Link 
          to="/?tab=comunidad" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'comunidad' ? 'active' : ''}`}
          style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === 'comunidad' ? '2px solid #D7B615' : '1px solid #555',
              backgroundColor: activeTab === 'comunidad' ? '#444' : 'transparent',
              color: activeTab === 'comunidad' ? '#D7B615' : '#eee',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'comunidad' ? 'bold' : 'normal'
          }}
        >
          Comunidad
          </div>
        </Link>
        
        <Link 
          to="/?tab=streaming" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'streaming' ? 'active' : ''}`}
          style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === 'streaming' ? '2px solid #D7B615' : '1px solid #555',
              backgroundColor: activeTab === 'streaming' ? '#444' : 'transparent',
              color: activeTab === 'streaming' ? '#D7B615' : '#eee',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'streaming' ? 'bold' : 'normal'
          }}
        >
          Streaming
          </div>
        </Link>
        
        <Link 
          to="/?tab=acerca" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'acerca' ? 'active' : ''}`}
          style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === 'acerca' ? '2px solid #D7B615' : '1px solid #555',
              backgroundColor: activeTab === 'acerca' ? '#444' : 'transparent',
              color: activeTab === 'acerca' ? '#D7B615' : '#eee',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'acerca' ? 'bold' : 'normal'
            }}
          >
            Acerca De
          </div>
        </Link>
        
        <Link 
          to="/?tab=perfil" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
          style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === 'perfil' ? '2px solid #D7B615' : '1px solid #555',
              backgroundColor: activeTab === 'perfil' ? '#444' : 'transparent',
              color: activeTab === 'perfil' ? '#D7B615' : '#eee',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'perfil' ? 'bold' : 'normal'
            }}
          >
            Mi Perfil
          </div>
        </Link>
      </div>

      {/* Mostrar contenido según la pestaña activa */}
      {activeTab === 'comunidad' && (
        <div className="comunidad-tab">
          {/* Mostrar anuncios en la parte superior */}
          <AnunciosList maxAnuncios={3} />
          
          {/* Resto del contenido de la comunidad */}
          <PostInput 
            onSubmitPost={handlePostSubmit} 
            isSubmitting={isSubmittingPost}
            selectedCategory={activeCategory}
          />
          <FilterButtons 
            activeCategory={activeCategory} 
            onCategoryChange={handleCategoryChange} 
          />
          {/* Lista de Posts */}
          {loadingPosts ? (
            <div>Cargando publicaciones...</div>
          ) : errorPosts ? (
            <div style={{ color: 'red' }}>{errorPosts}</div>
          ) : posts.length === 0 ? (
            <div>No hay publicaciones para mostrar en esta categoría.</div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* Sección Streaming */}
      {activeTab === 'streaming' && (
           <div>
          {/* <SearchBar placeholder="Buscar en streaming..." /> */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#232323', paddingBottom: '8px' }}>
             <SectionHeader title="Disfruta del contenido en vivo y grabado" />
          </div>
             <div className="streaming-layout">
               {/* Columna Izquierda: Player + Info */}
               <div className="streaming-main">
              <VideoPlayer video={streamingSelectedVideo} />
              <VideoInfo title="Mi Legado - Isaac Ramirez" />
               </div>
               {/* Columna Derecha: Playlist */}
               <div className="streaming-playlist">
                 {isLoadingStreaming && <p>Cargando videos...</p>}
                 {errorStreaming && <p style={{ color: 'red' }}>Error: {errorStreaming}</p>}
                 {!isLoadingStreaming && !errorStreaming && (
                <Playlist items={streamingPlaylistVideos} onSelectVideo={setStreamingSelectedVideo} />
                 )}
               </div>
             </div>
           </div>
      )}

      {/* Sección Acerca */}
      {activeTab === 'acerca' && (
        <div>
          <SectionHeader title="Acerca de Mi Legado" />
          <div style={{ background: '#353535', padding: '25px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '15px', color: '#D7B615' }}>Nuestra Misión</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '20px', color: 'rgba(255,255,255,0.85)' }}>
              En <strong>Mi Legado</strong>, nos dedicamos a impulsar a traders emergentes hacia el éxito financiero 
              a través de educación de alta calidad, mentorías personalizadas y herramientas 
              de análisis innovadoras. Creemos en un enfoque integral que combina teoría, práctica 
              y comunidad para transformar a principiantes en operadores consistentes y rentables.
            </p>
            
            <h2 style={{ marginBottom: '15px', color: '#D7B615' }}>Nuestra Historia</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '20px', color: 'rgba(255,255,255,0.85)' }}>
              Fundada en 2020 por un grupo de traders profesionales apasionados por la educación, 
              Mi Legado nació con el objetivo de democratizar el conocimiento financiero. Lo que comenzó 
              como un pequeño blog ha evolucionado en una plataforma educativa integral con más de 
              5,000 miembros activos en toda Latinoamérica. Nuestro compromiso con la excelencia 
              y el aprendizaje continuo nos ha posicionado como referentes en la industria.
            </p>
            
            <h2 style={{ marginBottom: '15px', color: '#D7B615' }}>Nuestro Equipo</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
              <div style={{ 
                flex: '1 1 200px', 
                background: '#444',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: '#666',
                  margin: '0 auto 10px',
                  backgroundImage: 'url(https://placehold.co/80x80)'
                }}></div>
                <h3 style={{ color: '#D7B615', marginBottom: '5px' }}>Isaac Ramírez</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '8px' }}>CEO & Fundador</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.5', fontSize: '0.9rem' }}>
                  Trader profesional con 15 años de experiencia en mercados internacionales.
                </p>
              </div>
              
              <div style={{ 
                flex: '1 1 200px', 
                background: '#444',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: '#666',
                  margin: '0 auto 10px',
                  backgroundImage: 'url(https://placehold.co/80x80)'
                }}></div>
                <h3 style={{ color: '#D7B615', marginBottom: '5px' }}>Alexandra Torres</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '8px' }}>Directora de Educación</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.5', fontSize: '0.9rem' }}>
                  Especialista en psicología de trading y estrategias de gestión de riesgo.
                </p>
              </div>
              
              <div style={{ 
                flex: '1 1 200px', 
                background: '#444',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: '#666',
                  margin: '0 auto 10px',
                  backgroundImage: 'url(https://placehold.co/80x80)'
                }}></div>
                <h3 style={{ color: '#D7B615', marginBottom: '5px' }}>Daniel López</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '8px' }}>Analista Técnico</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.5', fontSize: '0.9rem' }}>
                  Experto en análisis técnico avanzado y sistemas automatizados de trading.
                </p>
              </div>
            </div>
            
            <h2 style={{ marginBottom: '15px', color: '#D7B615' }}>Contacto</h2>
            <p style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' }}>
              ¿Tienes preguntas o comentarios? Contáctanos en <strong>info@milegado.com</strong><br/>
              Síguenos en nuestras redes sociales para estar al día con las últimas noticias y eventos.
            </p>
          </div>
        </div>
      )}

      {/* Sección Mi Perfil */}
      {activeTab === 'perfil' && (
        <div>
          <SectionHeader title="Mi Perfil" />
          <div style={{ background: '#353535', padding: '25px', borderRadius: '8px', marginBottom: '20px' }}>
            {currentUser ? (
              <UserProfile currentUser={currentUser} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'rgba(255,255,255,0.7)' }}>
                  Inicia sesión para ver tu perfil
                </p>
              <button 
                  onClick={() => navigate('/login')}
                style={{ 
                    padding: '12px 25px',
                    backgroundColor: '#D7B615',
                  color: '#222',
                    border: 'none',
                    borderRadius: '4px',
                  cursor: 'pointer',
                    fontWeight: 'bold'
                }}
              >
                  Iniciar sesión
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage; 