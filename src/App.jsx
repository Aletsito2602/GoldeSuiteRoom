import React, { useState } from 'react';
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ClassDetailPage from './pages/ClassDetailPage';
import PostDetailPage from './pages/PostDetailPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import useMediaQuery from './hooks/useMediaQuery';

// Crear componentes placeholder para las nuevas rutas
const ClasesPage = () => <div><h1>Página de Clases</h1></div>;
const StreamingPage = () => <div><h1>Página de Streaming</h1></div>;

// Componente para Rutas Protegidas
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!currentUser) {
    // Redirigir a login si no está autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
      <div className="app-container">
        <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} /> 
        <div className="main-layout">
          {!isMobile && <Sidebar isOpen={isSidebarOpen} />}
          <main className="content-area">
            {children}
          </main>
        </div>
      </div>
  );
}

function App() {
  const { currentUser } = useAuth(); // Necesario para redirigir desde /login si ya está logueado

  return (
    <Routes>
      {/* Ruta de Login */}
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} 
      />

      {/* Rutas Protegidas (Home y Detalles) */}
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

      {/* Podríamos añadir una ruta catch-all o 404 aquí */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;
