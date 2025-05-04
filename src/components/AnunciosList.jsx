import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const AnunciosList = ({ maxAnuncios = 3 }) => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnuncios = async () => {
      try {
        setLoading(true);
        // Consultar anuncios ordenados por fecha de creación descendente
        const anunciosQuery = query(
          collection(db, 'anuncios'),
          orderBy('createdAt', 'desc'),
          limit(maxAnuncios)
        );
        
        const snapshot = await getDocs(anunciosQuery);
        const anunciosList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAnuncios(anunciosList);
        setError(null);
      } catch (err) {
        console.error('Error al cargar anuncios:', err);
        setError('No se pudieron cargar los anuncios. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnuncios();
  }, [maxAnuncios]);

  if (loading) {
    return <div className="anuncios-loading">Cargando anuncios...</div>;
  }

  if (error) {
    return <div className="anuncios-error">{error}</div>;
  }

  if (anuncios.length === 0) {
    return null; // No mostrar nada si no hay anuncios
  }

  return (
    <div className="anuncios-container">
      <h2>Anuncios</h2>
      <div className="anuncios-list">
        {anuncios.map(anuncio => (
          <div key={anuncio.id} className="anuncio-item">
            <h3>{anuncio.titulo}</h3>
            <p>{anuncio.contenido}</p>
            {anuncio.createdAt && (
              <div className="anuncio-fecha">
                {new Date(anuncio.createdAt.seconds * 1000).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .anuncios-container {
          margin-bottom: 30px;
          padding: 15px;
          border-radius: 8px;
          background-color: #f9f9f9;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .anuncios-container h2 {
          color: #333;
          margin-top: 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .anuncios-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .anuncio-item {
          padding: 15px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .anuncio-item h3 {
          margin-top: 0;
          color: #D7B615;
          font-size: 1.2rem;
        }
        
        .anuncio-fecha {
          font-size: 0.8rem;
          color: #888;
          margin-top: 10px;
          text-align: right;
        }
        
        .anuncios-loading, .anuncios-error {
          padding: 15px;
          text-align: center;
          color: #666;
        }
        
        .anuncios-error {
          color: #d32f2f;
        }
        
        @media (min-width: 768px) {
          .anuncios-list {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .anuncio-item {
            flex: 1;
            min-width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default AnunciosList; 