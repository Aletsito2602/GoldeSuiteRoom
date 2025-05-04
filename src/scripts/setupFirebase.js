/**
 * Script para configuración inicial de Firebase y Firestore
 * Este script se ejecuta solo una vez durante la instalación de la aplicación
 */
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Función principal para configurar Firestore
 * Crea las colecciones y documentos iniciales necesarios
 */
export const setupFirestore = async () => {
  console.log('=== Iniciando configuración de Firestore ===');
  
  try {
    // 1. Verificar/Crear colección de usuarios
    await setupCollection('users');
    
    // 2. Verificar/Crear colección de posts
    await setupCollection('posts');
    
    // 3. Verificar/Crear colección de admin_logs
    await setupCollection('admin_logs');
    
    // 4. Crear documento de configuración
    await createConfigDocument();
    
    console.log('=== Configuración de Firestore completada ===');
    return true;
  } catch (error) {
    console.error('Error durante la configuración de Firestore:', error);
    return false;
  }
};

/**
 * Crea una colección con un documento de prueba para asegurar que existe
 */
const setupCollection = async (collectionName) => {
  try {
    console.log(`Verificando colección: ${collectionName}`);
    
    // Verificar si la colección tiene un documento de setup
    const setupDocRef = doc(collection(db, collectionName), 'setup');
    const setupDoc = await getDoc(setupDocRef);
    
    if (!setupDoc.exists()) {
      console.log(`Creando documento setup en colección ${collectionName}`);
      
      // Crear documento de configuración para inicializar la colección
      await setDoc(setupDocRef, {
        createdAt: serverTimestamp(),
        initialized: true,
        collectionName: collectionName,
        description: `Colección de ${collectionName} inicializada automáticamente`
      });
      
      console.log(`Colección ${collectionName} inicializada con éxito`);
    } else {
      console.log(`La colección ${collectionName} ya está inicializada`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error al configurar colección ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Crea o actualiza el documento de configuración principal
 */
const createConfigDocument = async () => {
  try {
    const configRef = doc(db, 'app_config', 'main');
    const configDoc = await getDoc(configRef);
    
    if (!configDoc.exists()) {
      console.log('Creando documento de configuración principal');
      
      await setDoc(configRef, {
        appName: 'Golden Suite Room',
        version: '1.0.0',
        lastSetup: serverTimestamp(),
        collections: ['users', 'posts', 'admin_logs'],
        features: {
          userProfiles: true,
          adminRoles: true,
          announcements: true
        }
      });
      
      console.log('Documento de configuración creado exitosamente');
    } else {
      console.log('Actualizando documento de configuración existente');
      
      await setDoc(configRef, {
        lastSetup: serverTimestamp(),
        updated: true
      }, { merge: true });
      
      console.log('Documento de configuración actualizado');
    }
    
    return true;
  } catch (error) {
    console.error('Error al crear documento de configuración:', error);
    throw error;
  }
}; 