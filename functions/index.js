const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

// Inicializar la aplicación Firebase Admin
initializeApp();

/**
 * Función HTTPS que puede ser llamada para dar rol de admin a un usuario
 * Requiere autenticación y que el solicitante ya sea admin
 */
exports.setAdminRole = onCall({ enforceAppCheck: true }, async (request) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Se requiere autenticación para esta operación"
      );
    }

    // Verificar que el solicitante es admin
    const callerUid = request.auth.uid;
    const callerUserRecord = await getAuth().getUser(callerUid);
    const callerClaims = callerUserRecord.customClaims || {};

    if (!callerClaims.admin) {
      throw new HttpsError(
        "permission-denied",
        "Requiere permisos de administrador para asignar roles"
      );
    }

    // Obtener el email del usuario a promover
    const { email } = request.data;
    if (!email) {
      throw new HttpsError("invalid-argument", "Email es requerido");
    }

    // Obtener el usuario por email
    const userRecord = await getAuth().getUserByEmail(email);
    
    // Establecer el claim de admin
    await getAuth().setCustomUserClaims(userRecord.uid, { admin: true });

    // Registrar cambio en Firestore
    await getFirestore().collection("admin_logs").add({
      action: "set_admin_role",
      targetUser: userRecord.uid,
      targetEmail: email,
      performedBy: callerUid,
      timestamp: new Date()
    });

    return {
      success: true,
      message: `Usuario ${email} ahora tiene rol de administrador`
    };
  } catch (error) {
    console.error("Error al establecer rol de administrador:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Función HTTPS que puede ser llamada para quitar rol de admin a un usuario
 * Requiere autenticación y que el solicitante ya sea admin
 */
exports.removeAdminRole = onCall({ enforceAppCheck: true }, async (request) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Se requiere autenticación para esta operación"
      );
    }

    // Verificar que el solicitante es admin
    const callerUid = request.auth.uid;
    const callerUserRecord = await getAuth().getUser(callerUid);
    const callerClaims = callerUserRecord.customClaims || {};

    if (!callerClaims.admin) {
      throw new HttpsError(
        "permission-denied",
        "Requiere permisos de administrador para quitar roles"
      );
    }

    // Obtener el email del usuario
    const { email } = request.data;
    if (!email) {
      throw new HttpsError("invalid-argument", "Email es requerido");
    }

    // Obtener el usuario por email
    const userRecord = await getAuth().getUserByEmail(email);
    
    // Quitar el claim de admin
    await getAuth().setCustomUserClaims(userRecord.uid, { admin: false });

    // Registrar cambio en Firestore
    await getFirestore().collection("admin_logs").add({
      action: "remove_admin_role",
      targetUser: userRecord.uid,
      targetEmail: email,
      performedBy: callerUid,
      timestamp: new Date()
    });

    return {
      success: true,
      message: `Usuario ${email} ya no tiene rol de administrador`
    };
  } catch (error) {
    console.error("Error al quitar rol de administrador:", error);
    throw new HttpsError("internal", error.message);
  }
}); 