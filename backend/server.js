import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Configuración de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Helper function para llamadas a Vimeo API
async function fetchVimeoAPI(url, accessToken) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error de Vimeo (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en fetchVimeoAPI:', error);
    throw error;
  }
}

// Endpoint para obtener videos de una carpeta
app.get('/api/vimeo/folder-videos', async (req, res) => {
  try {
    const accessToken = process.env.VIMEO_ACCESS_TOKEN;
    const userId = process.env.VIMEO_USER_ID;
    const folderId = req.query.folderId || process.env.VIMEO_FOLDER_ID;

    if (!accessToken || !userId || !folderId) {
      throw new Error('Configuración incompleta: Verifica las variables de entorno');
    }

    const url = `https://api.vimeo.com/users/${userId}/folders/${folderId}/videos`;
    const data = await fetchVimeoAPI(url, accessToken);
    
    res.json(data);
  } catch (error) {
    console.error('Error en /api/vimeo/folder-videos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
  console.log('Variables de entorno cargadas:', {
    PORT: process.env.PORT,
    VIMEO_USER_ID: process.env.VIMEO_USER_ID ? '***' : 'No configurado',
    VIMEO_FOLDER_ID: process.env.VIMEO_FOLDER_ID ? '***' : 'No configurado'
  });
}); 