import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ClassDetailPage from './pages/ClassDetailPage';
import PostDetailPage from './pages/PostDetailPage';
import ClientesPage from './pages/ClientesPage';
import AdminManager from './components/AdminManager';
import AnunciosManager from './components/AnunciosManager';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import useMediaQuery from './hooks/useMediaQuery';
import { db } from './firebaseConfig';
import { enableIndexedDbPersistence, collection, getDocs, query, limit } from 'firebase/firestore';
import { isUserAdmin } from './utils/authUtils';

// Componente para Rutas Protegidas
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!currentUser) {
    // Redirigir a login si no está autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Inicializar Sidebar abierto en escritorio y cerrado en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Actualizar estado del sidebar si cambia el tamaño de pantalla
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="app-container">
      <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} /> 
      <div className="main-layout">
        {/* Sidebar siempre presente, controlado por estado isSidebarOpen */}
        <Sidebar isOpen={isSidebarOpen} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}

// Componente para Rutas de Admin
function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  // Inicializar Sidebar abierto en escritorio y cerrado en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const admin = await isUserAdmin(currentUser.uid);
        setIsAdmin(admin);
      }
      setLoading(false);
    };
    
    checkAdmin();
  }, [currentUser]);
  
  // Actualizar estado del sidebar si cambia el tamaño de pantalla
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Renderizar estado de carga
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Redireccionar si no está autenticado
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redireccionar si no es admin
  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Renderizar contenido si es admin
  return (
      <div className="app-container">
        <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} /> 
        <div className="main-layout">
        <Sidebar isOpen={isSidebarOpen} />
          <main className="content-area">
            {children}
          </main>
        </div>
      </div>
  );
}

function App() {
  const { currentUser } = useAuth(); // Necesario para redirigir desde /login si ya está logueado
  const [firestoreStatus, setFirestoreStatus] = useState({ verified: false, error: null });

  // Verificar la configuración de Firestore al iniciar la app
  useEffect(() => {
    const checkFirestoreSetup = async () => {
      try {
        console.log('Verificando configuración de Firestore...');
        
        // Intentar habilitar persistencia offline (esto falla si ya está habilitada)
        try {
          await enableIndexedDbPersistence(db);
          console.log('Persistencia de IndexedDB habilitada');
        } catch (persistenceError) {
          if (persistenceError.code === 'failed-precondition') {
            console.warn('La persistencia de IndexedDB no pudo ser habilitada (múltiples pestañas abiertas)');
          } else if (persistenceError.code === 'unimplemented') {
            console.warn('El navegador no soporta IndexedDB persistente');
          } else {
            console.error('Error al configurar persistencia:', persistenceError);
          }
          // No es un error crítico, continuamos
        }
        
        // Intentar acceder a una colección para verificar la configuración
        try {
          console.log('Intentando leer datos de Firestore...');
          const testQuery = query(collection(db, 'test'), limit(1));
          await getDocs(testQuery);
          console.log('✅ Firestore está configurado correctamente');
          setFirestoreStatus({ verified: true, error: null });
        } catch (readError) {
          console.error('❌ Error al leer datos de Firestore:', readError);
          setFirestoreStatus({ verified: true, error: readError.message });
        }
      } catch (error) {
        console.error('Error general al verificar Firestore:', error);
        setFirestoreStatus({ verified: true, error: error.message });
      }
    };

    checkFirestoreSetup();
  }, []);

  // Log para desarrollo
  useEffect(() => {
    if (firestoreStatus.verified) {
      if (firestoreStatus.error) {
        console.error('⚠️ Estado de Firestore: Error detectado -', firestoreStatus.error);
      } else {
        console.log('✅ Estado de Firestore: Configuración verificada con éxito');
      }
    }
  }, [firestoreStatus]);

  return (
    <Routes>
      {/* Ruta de Login */}
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} 
      />

      {/* Rutas Protegidas */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/clases/:classId" 
        element={
          <ProtectedRoute>
            <ClassDetailPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/post/:postId" 
        element={
          <ProtectedRoute>
            <PostDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas de Administrador */}
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <AdminManager />
          </AdminRoute>
        }
      />
      <Route 
        path="/admin/anuncios" 
        element={
          <AdminRoute>
            <AnunciosManager />
          </AdminRoute>
        }
      />
      <Route 
        path="/admin/clientes" 
        element={
          <AdminRoute>
            <ClientesPage />
          </AdminRoute>
        }
      />

      {/* Ruta por defecto - Redirecciona a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
