const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin con la configuración de proyecto
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "golden-suite-room-vgdl8z"
});

// Obtener la instancia de Firestore
const db = getFirestore();

/**
 * Establece un usuario como administrador guardando un campo "admin: true" en Firestore
 * @param {string} email - Email del usuario a convertir en administrador
 */
async function setAdmin(email) {
  try {
    // Buscar el usuario por email en la colección "users"
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log(`No se encontró ningún usuario con el email: ${email}`);
      return { success: false, error: `Usuario no encontrado: ${email}` };
    }
    
    // Actualizar el campo admin a true
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({ admin: true });
    console.log(`Usuario ${email} establecido como administrador`);
    
    return { success: true, message: `Usuario ${email} ahora es administrador` };
  } catch (error) {
    console.error("Error al establecer rol de administrador:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Quita el rol de administrador a un usuario
 * @param {string} email - Email del usuario al que quitar permisos de administrador
 */
async function removeAdmin(email) {
  try {
    // Buscar el usuario por email en la colección "users"
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log(`No se encontró ningún usuario con el email: ${email}`);
      return { success: false, error: `Usuario no encontrado: ${email}` };
    }
    
    // Actualizar el campo admin a false
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({ admin: false });
    console.log(`Rol de administrador removido para: ${email}`);
    
    return { success: true, message: `Usuario ${email} ya no es administrador` };
  } catch (error) {
    console.error("Error al quitar rol de administrador:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Script para establecer múltiples administradores
 */
async function setMultipleAdmins(emails) {
  for (const email of emails) {
    console.log(`Procesando ${email}...`);
    const result = await setAdmin(email);
    console.log(result);
  }
  console.log('Procesamiento completado');
}

// Exportar las funciones
module.exports = {
  setAdmin,
  removeAdmin,
  setMultipleAdmins
}; 