import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
// Comentar la importación para evitar errores al inicializar
// import { setupFirestore } from './scripts/setupFirebase'

// Componente de inicialización que ejecuta la configuración
const FirebaseInitializer = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Ejecutar configuración al montar
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('Inicialización de Firebase desactivada durante desarrollo');
        // Comentar la inicialización para evitar errores
        // const success = await setupFirestore();
        setInitialized(true);
        // if (!success) {
        //   console.warn('Inicialización de Firebase completada con advertencias');
        // }
      } catch (err) {
        console.error('Error al inicializar Firebase:', err);
        setError(err.message);
        setInitialized(true); // Marcar como inicializado a pesar del error para continuar
      }
    };

    initializeFirebase();
  }, []);

  // Si hay un error, mostrar mensaje pero continuar con la aplicación
  if (error) {
    console.error('Error de inicialización:', error);
    // Aquí podrías mostrar un componente de error, pero seguimos renderizando la app
  }

  // Renderizar los hijos una vez inicializado
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
);
