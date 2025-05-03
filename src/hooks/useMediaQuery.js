import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Actualizar estado si el resultado de la query cambia
    const updateMatches = () => setMatches(media.matches);

    // Llamar inicialmente
    updateMatches();

    // Escuchar cambios futuros
    try {
      // Nuevo método (preferido)
      media.addEventListener('change', updateMatches);
    } catch (e1) {
      try {
        // Método deprecado (fallback para navegadores viejos)
        media.addListener(updateMatches); 
      } catch (e2) {
        console.error("Error adding media query listener:", e2);
      }
    }

    // Limpiar listener al desmontar
    return () => {
       try {
         media.removeEventListener('change', updateMatches);
       } catch (e1) {
          try {
            media.removeListener(updateMatches);
          } catch (e2) {
             console.error("Error removing media query listener:", e2);
          }
       }
    };
  }, [query]); // Re-ejecutar si la query cambia

  return matches;
}

export default useMediaQuery; 