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

    // Retrasar la inicialización para asegurar que el DOM esté listo
    setTimeout(initializeFirebase, 100);
  }, []);

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ color: '#e74c3c' }}>Error de inicialización</h2>
          <p style={{ color: '#333' }}>{error}</p>
          <p style={{ color: '#666' }}>La aplicación puede funcionar con funcionalidad limitada</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no está inicializado, mostrar pantalla de carga
  if (!initialized) {
    return null; // Dejar que el HTML inicial maneje la pantalla de carga
  }

  // Si todo está bien, renderizar la aplicación
  return children;
};

// Función para manejar errores no capturados
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Error no capturado:', { message, source, lineno, colno, error });
  return true;
};

// Función para manejar promesas no manejadas
window.onunhandledrejection = function(event) {
  console.error('Promesa no manejada:', event.reason);
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
