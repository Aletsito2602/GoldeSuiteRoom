import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { setupFirestore } from './scripts/setupFirebase'

// Componente de inicialización que ejecuta la configuración
const FirebaseInitializer = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('Iniciando inicialización de Firebase...');
        const success = await setupFirestore();
        console.log('Firebase inicializado:', success);
        setInitialized(true);
      } catch (err) {
        console.error('Error crítico al inicializar Firebase:', err);
        setError(err.message);
        setInitialized(true); // Permitir que la app continúe incluso con errores
      }
    };

    initializeFirebase();
  }, []);

  if (!initialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Cargando la aplicación...</h2>
          <p>Por favor espere mientras se inicializa Firebase</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <h2>Error de inicialización</h2>
          <p>{error}</p>
          <p>La aplicación puede funcionar con funcionalidad limitada</p>
        </div>
      </div>
    );
  }

  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FirebaseInitializer>
          <App />
        </FirebaseInitializer>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
