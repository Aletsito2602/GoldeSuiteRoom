/**
 * Script para sincronizar usuarios existentes en Firebase Authentication a Firestore
 * Este script debe ejecutarse con privilegios de administrador
 * 
 * Uso: node scripts/syncUsersToFirestore.js
 */

// Inicializar Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Asegúrate de tener este archivo

// Inicializar app con credenciales de administrador
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Referencias a servicios
const auth = admin.auth();
const db = admin.firestore();

/**
 * Función principal
 */
async function syncUsers() {
  console.log('Iniciando sincronización de usuarios...');
  
  try {
    // Obtener todos los usuarios de Authentication
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    console.log(`Encontrados ${users.length} usuarios en Authentication`);
    
    // Contador para estadísticas
    const stats = {
      created: 0,
      updated: 0,
      failed: 0,
      total: users.length
    };
    
    // Iterar por cada usuario y sincronizarlo
    for (const user of users) {
      try {
        // Referencia al documento de usuario en Firestore
        const userRef = db.collection('users').doc(user.uid);
        
        // Verificar si el usuario ya existe en Firestore
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          // Actualizar usuario existente
          await userRef.update({
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            lastSync: admin.firestore.FieldValue.serverTimestamp(),
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            phoneNumber: user.phoneNumber || ''
          });
          
          console.log(`Usuario actualizado: ${user.email}`);
          stats.updated++;
        } else {
          // Crear nuevo documento para el usuario
          await userRef.set({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            phoneNumber: user.phoneNumber || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            lastSync: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`Usuario creado: ${user.email}`);
          stats.created++;
        }
      } catch (userError) {
        console.error(`Error sincronizando usuario ${user.email}:`, userError);
        stats.failed++;
      }
    }
    
    // Mostrar resumen
    console.log('\nSincronización completada');
    console.log('---------------------------');
    console.log(`Total de usuarios: ${stats.total}`);
    console.log(`Usuarios creados: ${stats.created}`);
    console.log(`Usuarios actualizados: ${stats.updated}`);
    console.log(`Errores: ${stats.failed}`);
    
  } catch (error) {
    console.error('Error general en la sincronización:', error);
  }
}

// Ejecutar el script
syncUsers()
  .then(() => {
    console.log('Sincronización completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  }); 