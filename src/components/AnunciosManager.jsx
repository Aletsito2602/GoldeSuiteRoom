import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const AnunciosManager = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  // Cargar anuncios al montar el componente
  useEffect(() => {
    fetchAnuncios();
  }, []);

  // Función para cargar anuncios
  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      const anunciosCollection = collection(db, 'anuncios');
      const anunciosSnapshot = await getDocs(anunciosCollection);
      const anunciosList = anunciosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación (más reciente primero)
      anunciosList.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
      
      setAnuncios(anunciosList);
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar un anuncio
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!titulo || !contenido) {
      setMessage('Por favor, completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      if (editId) {
        // Actualizar anuncio existente
        await updateDoc(doc(db, 'anuncios', editId), {
          titulo,
          contenido,
          updatedAt: serverTimestamp()
        });
        setMessage('¡Anuncio actualizado correctamente!');
      } else {
        // Crear nuevo anuncio
        await addDoc(collection(db, 'anuncios'), {
          titulo,
          contenido,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setMessage('¡Anuncio creado correctamente!');
      }
      
      // Limpiar formulario
      setTitulo('');
      setContenido('');
      setEditId(null);
      
      // Recargar anuncios
      fetchAnuncios();
    } catch (error) {
      console.error('Error al guardar anuncio:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para editar un anuncio
  const handleEdit = (anuncio) => {
    setTitulo(anuncio.titulo);
    setContenido(anuncio.contenido);
    setEditId(anuncio.id);
  };

  // Función para eliminar un anuncio
  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'anuncios', id));
      setMessage('Anuncio eliminado correctamente');
      fetchAnuncios();
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anuncios-manager">
      <h2>Gestión de Anuncios</h2>
      
      <form onSubmit={handleSubmit} className="anuncio-form">
        <h3>{editId ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}</h3>
        
        <div className="form-group">
          <label htmlFor="titulo">Título:</label>
          <input 
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del anuncio"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contenido">Contenido:</label>
          <textarea 
            id="contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Contenido del anuncio"
            rows={5}
            required
          />
        </div>
        
        <div className="button-group">
          <button type="submit" disabled={loading}>
            {editId ? 'Actualizar Anuncio' : 'Crear Anuncio'}
          </button>
          
          {editId && (
            <button 
              type="button" 
              onClick={() => {
                setTitulo('');
                setContenido('');
                setEditId(null);
              }}
              className="cancel-button"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      
      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
      
      <div className="anuncios-list">
        <h3>Anuncios Actuales</h3>
        
        {loading ? (
          <p>Cargando anuncios...</p>
        ) : anuncios.length === 0 ? (
          <p>No hay anuncios disponibles.</p>
        ) : (
          <ul>
            {anuncios.map(anuncio => (
              <li key={anuncio.id} className="anuncio-item">
                <h4>{anuncio.titulo}</h4>
                <p>{anuncio.contenido}</p>
                <div className="fecha">
                  {anuncio.createdAt && (
                    <span>Creado: {new Date(anuncio.createdAt.seconds * 1000).toLocaleString()}</span>
                  )}
                </div>
                <div className="actions">
                  <button onClick={() => handleEdit(anuncio)} className="edit-button">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(anuncio.id)} className="delete-button">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <style jsx>{`
        .anuncios-manager {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .anuncio-form {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        input, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
        }
        
        button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          background-color: #4CAF50;
          color: white;
          cursor: pointer;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .cancel-button {
          background-color: #9e9e9e;
        }
        
        .edit-button {
          background-color: #2196F3;
        }
        
        .delete-button {
          background-color: #f44336;
        }
        
        .success-message {
          padding: 10px;
          background-color: #dff0d8;
          color: #3c763d;
          border-radius: 4px;
          margin: 15px 0;
        }
        
        .error-message {
          padding: 10px;
          background-color: #f2dede;
          color: #a94442;
          border-radius: 4px;
          margin: 15px 0;
        }
        
        .anuncios-list {
          margin-top: 30px;
        }
        
        .anuncio-item {
          background-color: #fff;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          margin-bottom: 15px;
          list-style: none;
        }
        
        .anuncio-item h4 {
          margin-top: 0;
          color: #333;
        }
        
        .fecha {
          font-size: 0.8em;
          color: #666;
          margin: 10px 0;
        }
        
        .actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default AnunciosManager; 