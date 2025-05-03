import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; // <<< Importar db
import { collection, query, orderBy, getDocs, Timestamp, addDoc, serverTimestamp } from "firebase/firestore"; // <<< Importar funciones Firestore
import { useAuth } from '../context/AuthContext'; // <<< Importar useAuth
// Importar los nuevos componentes
import PostInput from '../components/PostInput';
import FilterButtons from '../components/FilterButtons';
import PostCard from '../components/PostCard';
// Importar componentes de Clases
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import CollectionCard from '../components/CollectionCard';
import ClassCard from '../components/ClassCard';
// Importar componentes de Streaming
import VideoPlayer from '../components/VideoPlayer';
import VideoInfo from '../components/VideoInfo';
import Playlist from '../components/Playlist';

// Datos de ejemplo Clases
const sampleCollections = [
  { id: 'c1', title: 'Mindset', count: 5, icon: '🧠' },
  { id: 'c2', title: 'Golden Class', count: 2, icon: '📈' },
  { id: 'c3', title: 'Desafíos', count: 3, icon: '🏹' },
  { id: 'c4', title: 'Estrategias', count: 6, icon: '⚙️' },
];

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
  // Estado para la pestaña activa, inicializada en 'comunidad'
  const [activeTab, setActiveTab] = useState('comunidad');
  // <<< Nuevo estado para los videos de clases
  const [classVideos, setClassVideos] = useState([]); 
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [errorClasses, setErrorClasses] = useState(null);

  // <<< NUEVO ESTADO para posts >>>
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false); // <<< Estado para submit

  // <<< useEffect para cargar videos cuando la pestaña Clases está activa
  useEffect(() => {
    // Solo cargar si la pestaña Clases está activa y no se han cargado ya
    if (activeTab === 'clases' && classVideos.length === 0) {
      const fetchClassVideos = async () => {
        setIsLoadingClasses(true);
        setErrorClasses(null);
        try {
          // Llamada al backend (asegúrate que la URL es correcta)
          const response = await fetch('http://localhost:3001/api/vimeo/folder-videos'); 
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          const data = await response.json();
          
          // <<< Log para ver los datos crudos de Vimeo antes de mapear
          console.log("Datos recibidos de /api/vimeo/folder-videos:", data);
          
          const formattedData = data.map(video => {
            // Log para cada video individual
            console.log(`Procesando video - URI: ${video.uri}, Link: ${video.link}, Name: ${video.name}`);
            
            // Buscar una miniatura de tamaño adecuado (ej. ~640px de ancho)
            let thumbnailUrl = 'https://placehold.co/640x360/444/ccc?text=Clase'; // Placeholder por defecto
            if (video.pictures?.sizes) { // Verificar que pictures y sizes existen
              const suitableSize = video.pictures.sizes.find(size => size.width >= 600 && size.width <= 700);
              // Si no encontramos una cercana a 640, tomamos la última (usualmente la más grande) o la primera
              const chosenSize = suitableSize || video.pictures.sizes[video.pictures.sizes.length - 1] || video.pictures.sizes[0];
              if (chosenSize) {
                thumbnailUrl = chosenSize.link; // Usar el link directo del tamaño elegido
              }
            }
            
            const videoId = video.uri?.split('/').pop(); // Extraer ID
            console.log(`   ID extraído: ${videoId}`); // Log del ID extraído

            return {
              id: videoId || video.link, // Usar ID o link
              title: video.name || 'Video sin título',
              duration: video.duration ? new Date(video.duration * 1000).toISOString().substr(14, 5) : '--:--', 
              progress: 0, 
              thumbnailUrl: thumbnailUrl // Usar la URL encontrada o el placeholder
            };
          });
          setClassVideos(formattedData);
        } catch (error) {
          console.error("Error fetching class videos:", error);
          setErrorClasses(error.message);
        } finally {
          setIsLoadingClasses(false);
        }
      };

      fetchClassVideos();
    }
    // Dependencias: activeTab y classVideos.length para evitar recargas innecesarias
  }, [activeTab, classVideos.length]);

  // <<< Refactorizar fetchPosts para poder llamarla de nuevo >>>
  const fetchPosts = async () => {
      setLoadingPosts(true);
      setErrorPosts(null);
      try {
          const postsRef = collection(db, "posts");
          const q = query(postsRef, orderBy("createdAt", "desc")); 
          const querySnapshot = await getDocs(q);
          const fetchedPosts = [];
          querySnapshot.forEach((doc) => {
              fetchedPosts.push({ id: doc.id, ...doc.data() }); 
          });
          setPosts(fetchedPosts);
      } catch (err) {
          console.error("Error fetching posts:", err);
          setErrorPosts("No se pudieron cargar las publicaciones.");
      } finally {
          setLoadingPosts(false);
      }
  };

  // useEffect para cargar posts iniciales
  useEffect(() => {
    if (activeTab === 'comunidad') {
      fetchPosts(); 
    }
    // Quitar posts.length de dependencias para permitir recarga manual
  }, [activeTab]); 

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

  // <<< Función para manejar la creación de posts >>>
  const handlePostSubmit = async (content) => {
      if (!currentUser) return; // Doble chequeo
      
      setIsSubmittingPost(true);
      try {
          await addDoc(collection(db, "posts"), {
              content: content,
              authorUid: currentUser.uid,
              authorName: currentUser.displayName || currentUser.email,
              authorAvatarUrl: currentUser.photoURL || '',
              category: 'General',
              createdAt: serverTimestamp(),
              likes: 0,
              commentCount: 0,
              likedBy: []
          });
          fetchPosts(); 
      } catch (error) {
          console.error("Error adding post: ", error);
          setErrorPosts("Error al publicar."); // Mostrar error en la lista
      } finally {
          setIsSubmittingPost(false);
      }
  };

  return (
    <div>
      {/* <h1>Home Page</h1> --- Eliminado si no lo queremos */}

      {/* Sección del TabBar */}
      <div className="tab-bar" style={{ marginBottom: '20px', borderBottom: '1px solid #353535', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('comunidad')}
          // Estilo condicional: borde dorado si activo, sino borde oscuro/transparente
          style={{
            border: activeTab === 'comunidad' ? '1px solid #D7B615' : '1px solid #444',
            marginRight: '10px' // Espacio entre botones
          }}
        >
          Comunidad
        </button>
        <button 
          onClick={() => setActiveTab('clases')}
          style={{
            border: activeTab === 'clases' ? '1px solid #D7B615' : '1px solid #444',
            marginRight: '10px'
          }}
        >
          Clases
        </button>
        <button 
          onClick={() => setActiveTab('streaming')}
          style={{
            border: activeTab === 'streaming' ? '1px solid #D7B615' : '1px solid #444'
            // Sin margen derecho en el último
          }}
        >
          Streaming
        </button>
      </div>

      {/* Contenido condicional basado en la pestaña activa */}
      <div className="tab-content">
        {activeTab === 'comunidad' && (
          <div>
            <PostInput 
              onPostSubmit={handlePostSubmit} 
              isSubmitting={isSubmittingPost} 
            />
            <FilterButtons />
            <div className="feed">
              {loadingPosts && <p>Cargando publicaciones...</p>}
              {errorPosts && <p style={{ color: 'red' }}>{errorPosts}</p>}
              {!loadingPosts && !errorPosts && posts.length === 0 && <p>No hay publicaciones todavía.</p>}
              {!loadingPosts && !errorPosts && posts.map(post => (
                <PostCard 
                    key={post.id} 
                    // Pasar datos mapeados si es necesario, incluyendo el ID real
                    post={{
                        ...post,
                        // Sobreescribir/formatear campos si el formato de PostCard lo requiere
                        // Por ejemplo, formatear la fecha
                        time: formatFirestoreTimestamp(post.createdAt) 
                    }}
                />
              ))}
            </div>
          </div>
        )}
        {activeTab === 'clases' && (
          <div>
            <SearchBar placeholder="Buscar en clases..." />
            <SectionHeader title="Aprende, Crece y Triunfa con AGM" />
            
            <h3 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '15px' }}>Explora nuestras colecciones:</h3>
            <div className="collection-grid">
              {sampleCollections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>

            {/* Renderizado condicional de videos de clases */}
            {isLoadingClasses && <p>Cargando clases...</p>}
            {errorClasses && <p style={{ color: 'red' }}>Error al cargar clases: {errorClasses}</p>}
            {!isLoadingClasses && !errorClasses && classVideos.length === 0 && <p>No hay clases disponibles en este momento.</p>}
            {!isLoadingClasses && !errorClasses && classVideos.map(classInfo => (
              <ClassCard key={classInfo.id} classInfo={classInfo} />
            ))}
          </div>
        )}
        {activeTab === 'streaming' && (
          <div>
            <SearchBar placeholder="Buscar en streaming..." />
            <SectionHeader title="Disfruta del contenido en vivo y grabado" />
            
            <div className="streaming-layout">
              {/* Columna Izquierda: Player + Info */}
              <div className="streaming-main">
                <VideoPlayer /> 
                <VideoInfo title="Estrategias trading para potenciar tus operaciones" status="LIVE" />
              </div>

              {/* Columna Derecha: Playlist */}
              <div className="streaming-playlist">
                <Playlist items={samplePlaylistItems} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal de la aplicación irá aquí */}
    </div>
  );
}

export default HomePage; 