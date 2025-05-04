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
        const success = await setupFirestore();
        setInitialized(true);
        if (!success) {
          console.warn('Inicialización de Firebase completada con advertencias');
        }
      } catch (err) {
        console.error('Error al inicializar Firebase:', err);
        setError(err.message);
        setInitialized(true);
      }
    };

    initializeFirebase();
  }, []);

  if (error) {
    console.error('Error de inicialización:', error);
  }

  return initialized ? children : <div>Cargando...</div>;
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
