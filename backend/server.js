import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

// Cargar variables de entorno desde .env
dotenv.config({ path: 'backend/.env' });

const app = express();
const port = process.env.PORT || 3001;

// Habilitar CORS para permitir peticiones desde el frontend (Vite corre en otro puerto)
app.use(cors()); 

// Middleware para parsear JSON (aunque no lo usemos ahora, es útil)
app.use(express.json());

// Helper function para hacer la llamada a Vimeo API
async function fetchVimeoAPI(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }
  });
  if (!response.ok) {
    // Manejo de errores mejorado como hicimos para el endpoint de video único
    if (response.status === 404) {
        throw new Error('Recurso no encontrado en Vimeo (404)');
    } else if (response.status === 403) {
        throw new Error('Acceso prohibido por Vimeo (403) - Verifica permisos del token');
    }
    let errorBody = 'Error desconocido';
    try { errorBody = await response.text(); } catch (e) { /* ignore */ }
    throw new Error(`Error de Vimeo (${response.status}): ${errorBody}`);
  }
  return await response.json();
}

// Endpoint para obtener TODOS los videos de una carpeta específica (con paginación)
app.get('/api/vimeo/folder-videos', async (req, res) => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const userId = process.env.VIMEO_USER_ID;
  const folderId = process.env.VIMEO_FOLDER_ID;

  if (!accessToken || !userId || !folderId) {
    return res.status(500).json({ message: 'Error de configuración: Faltan variables de entorno de Vimeo.' });
  }

  let allVideos = [];
  let nextUrl = `https://api.vimeo.com/users/${userId}/folders/${folderId}/videos?fields=uri,name,description,duration,pictures,stats,link&per_page=50`; // Pedir 50 por página
  
  console.log("Backend: Iniciando obtención de videos de carpeta con paginación...");

  try {
    while (nextUrl) {
      console.log(`Backend: Obteniendo página: ${nextUrl}`);
      const data = await fetchVimeoAPI(nextUrl, accessToken);
      
      if (data && data.data) {
          allVideos = allVideos.concat(data.data);
      }
      
      // Verificar si hay una página siguiente
      if (data.paging && data.paging.next) {
        nextUrl = `https://api.vimeo.com${data.paging.next}`; // Construir URL completa para la siguiente página
      } else {
        nextUrl = null; // No hay más páginas
      }
    }
    
    console.log(`Backend: Total de videos obtenidos: ${allVideos.length}`);
    res.json(allVideos); // Devolver el array completo de videos

  } catch (error) {
    console.error('Error en el servidor al obtener videos de carpeta:', error);
    // Enviar un error más específico si es posible
    const status = error.message.includes('404') ? 404 : error.message.includes('403') ? 403 : 500;
    res.status(status).json({ message: error.message || 'Error interno del servidor' });
  }
});

// Endpoint para obtener detalles de un video específico
app.get('/api/vimeo/video/:videoId', async (req, res) => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const videoId = req.params.videoId;
  
  // <<< Log para depuración
  console.log(`Backend: Intentando obtener detalles para video ID: ${videoId}`); 

  if (!accessToken) {
    return res.status(500).json({ message: 'Error de configuración: Falta token de acceso de Vimeo.' });
  }
  if (!videoId) {
    return res.status(400).json({ message: 'Falta el ID del video.' });
  }

  // Quitar embed.html de los fields solicitados
  const url = `https://api.vimeo.com/videos/${videoId}?fields=uri,name,description,duration,pictures.base_link,stats,link,user.name`;

  try {
    const vimeoResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });

    if (!vimeoResponse.ok) {
      if (vimeoResponse.status === 404) {
        console.error(`Video ${videoId} not found on Vimeo.`);
        return res.status(404).json({ message: 'Video no encontrado en Vimeo (404 desde Vimeo)' });
      }
      
      let errorBody = null;
      try {
        errorBody = await vimeoResponse.text();
      } catch (parseError) {
        console.error('Could not parse error body from Vimeo');
      }
      console.error(`Error fetching video ${videoId} from Vimeo. Status: ${vimeoResponse.status}`, errorBody);
      return res.status(vimeoResponse.status).json({ 
        message: `Error al obtener detalles del video de Vimeo (Status: ${vimeoResponse.status})`,
        error: errorBody 
      });
    }

    const data = await vimeoResponse.json();
    res.json(data); // Devolver el objeto completo del video

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
}); 