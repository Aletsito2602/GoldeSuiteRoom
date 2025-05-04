import { db, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp, collection } from 'firebase/firestore';

/**
 * Función para inicializar la colección de usuarios para el usuario actual
 * Esta función se puede llamar manualmente desde componentes para forzar la creación del documento
 */
export const initializeUserDocument = async () => {
  try {
    // Verificar si hay un usuario autenticado
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No hay usuario autenticado. Inicia sesión primero.');
      return false;
    }

    // Verificar si ya existe el documento
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    console.log('Inicializando documento de usuario para:', currentUser.email);
    
    if (userSnap.exists()) {
      console.log('El documento de usuario ya existe. Actualizando timestamp.');
      // Solo actualizar timestamp
      await setDoc(
        userRef, 
        { lastLogin: serverTimestamp() }, 
        { merge: true }
      );
    } else {
      console.log('Creando nuevo documento de usuario');
      // Crear documento completo
      await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || "",
        photoURL: currentUser.photoURL || "",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    }
    
    // Verificar de nuevo si se creó
    const updatedSnap = await getDoc(userRef);
    if (updatedSnap.exists()) {
      console.log('Documento creado/actualizado exitosamente:', updatedSnap.data());
      return true;
    } else {
      console.error('No se pudo verificar la creación del documento.');
      return false;
    }
  } catch (error) {
    console.error('Error al inicializar documento de usuario:', error);
    return false;
  }
};

/**
 * Función para comprobar la conexión a Firestore
 * Útil para depurar problemas de configuración
 */
export const testFirestoreConnection = async () => {
  try {
    console.log('Probando conexión a Firestore...');
    
    // Intentar acceder a una colección
    const testRef = collection(db, 'test');
    console.log('Referencia a colección creada:', testRef.path);
    
    // Intentar crear un documento temporal para probar permisos
    const testDoc = doc(collection(db, 'test'), 'test-connection');
    await setDoc(testDoc, { 
      timestamp: serverTimestamp(),
      message: 'Test de conexión'
    });
    
    console.log('Conexión a Firestore exitosa. Documento temporal creado.');
    return true;
  } catch (error) {
    console.error('Error al conectar con Firestore:', error);
    return false;
  }
}; 