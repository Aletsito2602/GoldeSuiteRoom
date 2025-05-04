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
  const [loadingStep, setLoadingStep] = useState('Iniciando...');

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('Paso 1: Iniciando inicialización de Firebase...');
        setLoadingStep('Conectando con Firebase...');
        
        // Verificar si las variables de entorno están disponibles
        const envVars = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        };

        console.log('Variables de entorno:', {
          ...envVars,
          apiKey: envVars.apiKey ? '***' : 'No configurada'
        });

        if (!envVars.apiKey || !envVars.projectId) {
          throw new Error('Faltan variables de entorno de Firebase');
        }

        console.log('Paso 2: Configurando Firestore...');
        setLoadingStep('Configurando base de datos...');
        const success = await setupFirestore();
        
        if (!success) {
          throw new Error('Error al configurar Firestore');
        }

        console.log('Paso 3: Firebase inicializado correctamente');
        setLoadingStep('Inicialización completada');
        setInitialized(true);
      } catch (err) {
        console.error('Error crítico al inicializar Firebase:', err);
        setError(err.message);
        setLoadingStep('Error en la inicialización');
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
          <p style={{ color: '#666' }}>Estado: {loadingStep}</p>
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

  // Si no está inicializado, mostrar pantalla de carga con estado actual
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
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>Cargando Mi Legado...</h2>
          <p>{loadingStep}</p>
        </div>
      </div>
    );
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
