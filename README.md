# Golden Suite Room Web App

Aplicación web para la plataforma Golden Suite Room, que combina una red social para comunidad, streaming de videos y más.

## Características

1. **Autenticación de Usuarios**: Registro e inicio de sesión con Firebase Authentication.
2. **Perfiles de Usuario**: Información detallada y personalizable de cada usuario.
   - Fotos de perfil personalizables con carga de imágenes
   - Datos de contacto
   - Biografía personalizada
3. **Comunidad Social**: Publicaciones, comentarios y likes.
4. **Filtros de Contenido**: Filtrar entre publicaciones generales y anuncios.
5. **Restricciones de Publicación**: Solo administradores pueden publicar en la sección "Anuncios".
6. **Streaming de Videos**: Visualización de contenido desde Vimeo.
7. **UI Mejorada**: Interfaz de usuario con estilos personalizados.

## Tecnologías Utilizadas

- React.js para el frontend
- Firebase Authentication para autenticación
- Cloud Firestore como base de datos
- Firebase Cloud Functions para lógica del servidor
- API de Vimeo para streaming de contenido de video

## Estructura de Datos en Firestore

La aplicación utiliza las siguientes colecciones en Firestore:

1. **users**: Almacena información de perfiles de usuario
   - Campos: uid, email, displayName, photoURL, bio, location, website, phoneNumber, createdAt, lastLogin, etc.

2. **posts**: Almacena las publicaciones de la comunidad
   - Campos: content, authorUid, authorName, authorAvatarUrl, category, createdAt, likes, commentCount, etc.

3. **admin_logs**: Registra actividades administrativas
   - Campos: action, targetUser, targetEmail, performedBy, timestamp, etc.

## Almacenamiento de Imágenes

La aplicación utiliza Firebase Storage para gestionar imágenes:

1. **Fotos de Perfil**: Almacenadas en la carpeta `profile_images/{userId}/`
   - Cada usuario puede subir su foto de perfil
   - Las imágenes se muestran en la vista de perfil y en las publicaciones del foro
   - Límite de tamaño: 5MB

2. **Imágenes Públicas**: Almacenadas en la carpeta `public/`
   - Pueden incluir imágenes para publicaciones, anuncios, etc.
   - Límite de tamaño: 10MB

## Configuración de Administradores

El sistema incluye roles de usuario donde los administradores tienen permisos especiales como publicar anuncios. Para asignar el rol de administrador a un usuario:

### Método 1: Usando Firebase Console y CLI

1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión en Firebase: `firebase login`
3. Configura el proyecto: `firebase use --add` (selecciona tu proyecto)
4. Ejecuta el script para asignar rol de administrador:
   ```
   node -e "require('./functions/setAdminRole').setAdmin('email-del-usuario@ejemplo.com')"
   ```

### Método 2: Usando Cloud Functions (requiere un administrador existente)

Una vez que ya existe un usuario administrador en el sistema, este puede asignar el rol a otros usuarios directamente desde la interfaz de administración:

1. Inicia sesión con una cuenta de administrador
2. Navega a la sección de "Administración" 
3. Usa la función "Asignar rol de administrador" proporcionando el email del usuario

## Restricciones de Publicación

- **Sección "General"**: Todos los usuarios autenticados pueden publicar
- **Sección "Anuncios"**: Solo usuarios con rol de administrador pueden publicar

## Instrucciones de Desarrollo

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura Firebase: Crea un archivo `.env` con tus credenciales
4. Ejecuta el servidor de desarrollo: `npm start`

## Implementación de Cloud Functions

Para implementar las Cloud Functions:

1. Navega a la carpeta de funciones: `cd functions`
2. Instala dependencias: `npm install`
3. Implementa: `firebase deploy --only functions`

## Contribuciones

Las contribuciones son bienvenidas. Por favor, asegúrate de seguir las guías de estilo del proyecto.
