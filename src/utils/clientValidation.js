/**
 * Utilidades para validar si un usuario está en la lista de clientes autorizados
 */

/**
 * Función para convertir el CSV a un array de objetos
 * @param {string} csvString - Contenido del archivo CSV
 * @returns {Array} - Array de objetos con los datos de los clientes
 */
const parseCSV = (csvString) => {
  const lines = csvString.split('\n');
  
  // Saltar la primera línea (encabezados) y procesar cada línea
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const cols = line.split(',');
      
      // Extraer los datos relevantes usando los índices correctos
      return {
        Name: cols[3] || '', // Nombre
        Email: cols[2] || '', // Email
        Card_Address_Country: cols[12] || '', // País
        'Created (UTC)': cols[4] || '', // Fecha
        TotalSpend: cols[28] || '' // Monto
      };
    });
};

/**
 * Verifica si un correo electrónico está en la lista de clientes autorizados
 * @param {string} email - Correo electrónico a verificar
 * @returns {Promise<{isValid: boolean, clientInfo: Object|null}>} - Resultado de la validación
 */
export const validateClientEmail = async (email) => {
  try {
    // Obtener el archivo CSV
    const response = await fetch('/clientes.csv');
    
    if (!response.ok) {
      console.error('Error al cargar el archivo CSV:', response.statusText);
      return { isValid: false, clientInfo: null };
    }
    
    const csvData = await response.text();
    const clients = parseCSV(csvData);
    
    // Buscar el cliente por correo electrónico (case insensitive)
    const emailLowerCase = email.toLowerCase();
    const client = clients.find(client => 
      client.Email && client.Email.toLowerCase() === emailLowerCase
    );
    
    return {
      isValid: !!client,
      clientInfo: client || null
    };
  } catch (error) {
    console.error('Error al validar cliente:', error);
    return { isValid: false, clientInfo: null };
  }
}; 