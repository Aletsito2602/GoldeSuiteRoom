import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

// Crear el contexto
const AuthContext = createContext();

// Hook para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Estado para saber si ya se verificó el estado inicial

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth State Changed:", user); // Log para depuración
      setCurrentUser(user); // user será null si no está logueado, o el objeto user si lo está
      setLoadingAuth(false); // Marcar que la carga inicial terminó
    });

    // Limpiar el listener al desmontar el componente
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loadingAuth
    // Podríamos añadir funciones como logout aquí si quisiéramos
  };

  // No renderizar nada hasta que sepamos si hay usuario o no (evita flashes)
  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children} 
    </AuthContext.Provider>
  );
} 