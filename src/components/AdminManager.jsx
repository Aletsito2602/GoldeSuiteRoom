import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const AdminManager = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para hacer administrador a un usuario
  const makeAdmin = async (isAdmin = true) => {
    if (!email) {
      setMessage('Por favor, introduce un email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Buscar usuario por email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage(`No se encontró usuario con el email: ${email}`);
        setLoading(false);
        return;
      }

      // Actualizar el campo admin del usuario
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        admin: isAdmin
      });

      setMessage(
        isAdmin 
          ? `¡Usuario ${email} ahora es administrador!` 
          : `¡Usuario ${email} ya no es administrador!`
      );
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="admin-manager">
      <h2>Administrar Permisos</h2>
      
      <div className="form-group">
        <label htmlFor="email">Email del Usuario:</label>
        <input 
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa el email del usuario"
        />
      </div>
      
      <div className="actions">
        <button 
          onClick={() => makeAdmin(true)}
          disabled={loading}
        >
          Hacer Administrador
        </button>
        
        <button 
          onClick={() => makeAdmin(false)}
          disabled={loading}
          className="remove-admin"
        >
          Quitar Permisos
        </button>
      </div>
      
      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
      
      <style jsx>{`
        .admin-manager {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
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
        
        .remove-admin {
          background-color: #f44336;
        }
        
        .success-message {
          padding: 10px;
          background-color: #dff0d8;
          color: #3c763d;
          border-radius: 4px;
        }
        
        .error-message {
          padding: 10px;
          background-color: #f2dede;
          color: #a94442;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AdminManager; 