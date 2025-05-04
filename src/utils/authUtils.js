import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Verifica si un usuario es administrador basado en el campo 'admin' en Firestore
 * @param {string} userId - ID del usuario a verificar
 * @returns {Promise<boolean>} - true si el usuario es admin, false en caso contrario
 */
export const isUserAdmin = async (userId) => {
  try {
    if (!userId) return false;
    
    // Obtener documento del usuario
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    // Verificar si existe y tiene el campo admin en true
    if (userDoc.exists() && userDoc.data().admin === true) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error al verificar rol de administrador:", error);
    return false;
  }
};

/**
 * Hook personalizado para verificar permisos de administrador
 * Ejemplo de uso: 
 * const AdminRoute = ({ children }) => {
 *   const { user } = useAuth();
 *   const [isAdmin, setIsAdmin] = useState(false);
 *   const [loading, setLoading] = useState(true);
 *
 *   useEffect(() => {
 *     const checkAdminStatus = async () => {
 *       if (user) {
 *         const adminStatus = await isUserAdmin(user.uid);
 *         setIsAdmin(adminStatus);
 *       }
 *       setLoading(false);
 *     };
 *     
 *     checkAdminStatus();
 *   }, [user]);
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (!isAdmin) return <Navigate to="/unauthorized" />;
 *   
 *   return children;
 * };
 */ 