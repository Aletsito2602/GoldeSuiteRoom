# Configuración y Solución de Problemas de Firestore

Este documento proporciona instrucciones para configurar correctamente Firestore en la aplicación Golden Suite Room, así como para solucionar problemas comunes.

## Requisitos Previos

1. Cuenta de Firebase
2. Proyecto creado en Firebase
3. Firestore Database habilitada en el proyecto
4. Firebase Authentication habilitada

## Verificación de Configuración

La aplicación intentará verificar la configuración de Firestore automáticamente al iniciar. Puedes ver los resultados en la consola del navegador.

## Pasos para Solucionar Problemas con Colección de Usuarios

Si los usuarios se registran pero no aparecen en la colección "users" de Firestore, sigue estos pasos:

### 1. Verificar Reglas de Seguridad

Asegúrate de que las reglas de seguridad de Firestore permitan la creación y lectura de documentos:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // ... otras reglas
  }
}
```

### 2. Verificar Inicialización Manual

Puedes inicializar manualmente la colección de usuarios:

1. Ve a la página de perfil de usuario
2. En la sección "Herramientas de Diagnóstico", haz clic en "Inicializar Perfil en Firestore"
3. Verifica la consola para ver los resultados

### 3. Ejecutar Script de Sincronización

Si tienes varios usuarios que necesitan ser sincronizados, puedes ejecutar el script de sincronización:

1. Asegúrate de tener archivo `serviceAccountKey.json` en la raíz del proyecto (obtenido desde Firebase Console → Configuración del proyecto → Cuentas de servicio)

2. Ejecuta el script:
   ```
   node scripts/syncUsersToFirestore.js
   ```

### 4. Verificar Permisos de Firebase

Asegúrate de que el usuario tenga permisos para escribir en Firestore:

1. Ve a Firebase Console → Authentication
2. Verifica que el usuario esté registrado correctamente
3. Asegúrate de que no haya restricciones de IP o dominio que bloqueen el acceso

## Problemas Comunes y Soluciones

### No se crean documentos en Firestore

**Causas posibles:**
- Reglas de seguridad demasiado restrictivas
- Error en la configuración de Firebase
- Permisos insuficientes

**Soluciones:**
1. Verifica reglas de seguridad en Firebase Console
2. Revisa la consola del navegador para errores específicos
3. Verifica que la API de Firestore esté habilitada en Google Cloud Console

### Error "Missing or insufficient permissions"

**Causas posibles:**
- Reglas de seguridad que impiden la escritura
- Token de autenticación no válido o expirado

**Soluciones:**
1. Actualiza las reglas de seguridad para permitir operaciones necesarias
2. Cierra sesión y vuelve a iniciar sesión para renovar el token
3. Verifica que el usuario esté correctamente autenticado antes de intentar operaciones

### Error "Quota exceeded"

**Causas posibles:**
- Has alcanzado el límite de uso gratuito de Firestore
- Demasiadas operaciones en poco tiempo

**Soluciones:**
1. Verifica tu uso actual en Firebase Console → Usage and Billing
2. Actualiza a un plan de pago si es necesario
3. Implementa limitaciones de velocidad en tu aplicación

## Herramientas de Diagnóstico Incorporadas

La aplicación incluye herramientas de diagnóstico en la página de perfil:

1. **Inicializar Perfil en Firestore**: Intenta crear o actualizar manualmente el documento del usuario en la colección "users".

2. **Probar Conexión a Firestore**: Verifica si la aplicación puede conectarse a Firestore y realizar operaciones básicas.

## Contacto y Soporte

Si continúas experimentando problemas, contacta al equipo de desarrollo:

- Correo: soporte@goldensuite.com
- Repositorio: github.com/golden-suite-room/support 