import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

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
  const [isAdmin, setIsAdmin] = useState(false); // Nuevo estado para el rol de administrador
  const [userProfile, setUserProfile] = useState(null); // Estado para el perfil del usuario

  // Función para iniciar sesión
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Función para sincronizar usuario en Firestore
  const syncUserWithFirestore = async (user, additionalData = null) => {
    if (!user) {
      console.log('syncUserWithFirestore: No hay usuario para sincronizar');
      return null;
    }
    
    console.log('syncUserWithFirestore: Intentando sincronizar usuario', user.uid);
    
    try {
      // Referencia al documento del usuario en la colección 'users'
      const userRef = doc(db, "users", user.uid);
      console.log('syncUserWithFirestore: Referencia creada para', userRef.path);
      
      // Obtener el documento del usuario
      console.log('syncUserWithFirestore: Intentando obtener documento existente...');
      const userSnap = await getDoc(userRef);
      console.log('syncUserWithFirestore: Documento recuperado, existe:', userSnap.exists());
      
      let userData = null;
      
      if (userSnap.exists()) {
        // Si el documento ya existe, actualizar lastLogin y photoURL
        userData = userSnap.data();
        console.log('syncUserWithFirestore: Actualizando lastLogin y foto para documento existente');
        
        try {
          await setDoc(userRef, {
            ...userData,
            photoURL: user.photoURL || userData.photoURL || "", // Actualizar foto desde Auth
            lastLogin: serverTimestamp()
          }, { merge: true });
          console.log('syncUserWithFirestore: Actualización exitosa');
        } catch (updateError) {
          console.error('syncUserWithFirestore: Error al actualizar documento existente:', updateError);
          // Seguir con los datos existentes a pesar del error
        }
      } else {
        // Si no existe, crear un nuevo documento con información básica
        console.log('syncUserWithFirestore: Creando nuevo documento de usuario');
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        };
        
        // Si hay datos adicionales (como del CSV), añadirlos al documento
        if (additionalData) {
          userData = {
            ...userData,
            clientData: additionalData
          };
        }
        
        try {
          await setDoc(userRef, userData);
          console.log('syncUserWithFirestore: Documento creado con éxito');
        } catch (createError) {
          console.error('syncUserWithFirestore: Error al crear documento:', createError);
          // Seguir con los datos de userData pero devolver error
          return null;
        }
      }
      
      // Verificar que los datos fueron almacenados correctamente
      try {
        console.log('syncUserWithFirestore: Verificando documento...');
        const verifySnap = await getDoc(userRef);
        if (verifySnap.exists()) {
          console.log('syncUserWithFirestore: Verificación exitosa, documento existe');
          console.log('Datos del documento:', verifySnap.data());
        } else {
          console.error('syncUserWithFirestore: ¡El documento no existe después de guardarlo!');
        }
      } catch (verifyError) {
        console.error('syncUserWithFirestore: Error al verificar documento:', verifyError);
      }
      
      setUserProfile(userData);
      console.log('syncUserWithFirestore: userProfile actualizado en state');
      return userData;
    } catch (error) {
      console.error("Error al sincronizar usuario con Firestore:", error);
      return null;
    }
  };

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed:", user); // Log para depuración
      
      if (user) {
        setCurrentUser(user); // Establecer el usuario
        
        // Sincronizar con Firestore
        await syncUserWithFirestore(user);
        
        try {
          // Verificar si el usuario es admin obteniendo los claims del token
          console.log("Obteniendo token del usuario...");
          const idTokenResult = await user.getIdTokenResult(true); // Forzar actualización del token
          console.log("Token obtenido. Claims:", idTokenResult.claims);
          const hasAdminRole = !!idTokenResult.claims.admin;
          setIsAdmin(hasAdminRole);
          console.log("Es administrador:", hasAdminRole);
        } catch (error) {
          console.error("Error al verificar rol de administrador:", error);
          setIsAdmin(false);
        }
      } else {
        // Si no hay usuario, resetear todo
        setCurrentUser(null);
        setIsAdmin(false);
        setUserProfile(null);
      }
      
      setLoadingAuth(false); // Marcar que la carga inicial terminó
    });

    // Limpiar el listener al desmontar el componente
    return unsubscribe;
  }, []);
  
  // Función para forzar la actualización del token y verificar los claims de nuevo
  const refreshUserClaims = async () => {
    if (!currentUser) return false;
    
    try {
      console.log("Forzando actualización del token...");
      // Forzar actualización del token
      await currentUser.getIdToken(true);
      
      // Obtener token actualizado con claims nuevos
      console.log("Verificando claims actualizados...");
      const idTokenResult = await currentUser.getIdTokenResult();
      console.log("Claims actualizados:", idTokenResult.claims);
      const hasAdminRole = !!idTokenResult.claims.admin;
      
      // Actualizar el estado
      setIsAdmin(hasAdminRole);
      console.log("Claims actualizados. Es administrador:", hasAdminRole);
      
      return true;
    } catch (error) {
      console.error("Error al actualizar claims:", error);
      return false;
    }
  };

  // Función para actualizar el perfil del usuario en Firestore
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return false;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Actualizar el estado local
      setUserProfile(prev => ({
        ...prev,
        ...profileData
      }));
      
      return true;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      return false;
    }
  };

  // Función para guardar datos de cliente desde CSV
  const saveClientInfoToProfile = async (clientInfo) => {
    if (!currentUser) return false;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        clientData: clientInfo,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Actualizar el estado local
      setUserProfile(prev => ({
        ...prev,
        clientData: clientInfo
      }));
      
      return true;
    } catch (error) {
      console.error("Error al guardar datos de cliente:", error);
      return false;
    }
  };

  const value = {
    currentUser,
    loadingAuth,
    isAdmin, // Exponer el estado de admin
    userProfile, // Exponer el perfil del usuario
    login, // Función de login
    refreshUserClaims, // Exponer la función de actualización de claims
    updateUserProfile, // Exponer función para actualizar perfil
    syncUserWithFirestore, // Exponer función para sincronizar usuario
    saveClientInfoToProfile // Exponer función para guardar datos de cliente
  };

  // No renderizar nada hasta que sepamos si hay usuario o no (evita flashes)
  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children} 
    </AuthContext.Provider>
  );
} 