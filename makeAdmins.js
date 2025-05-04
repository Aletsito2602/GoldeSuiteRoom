// Script para hacer admin a usuarios específicos
const { setMultipleAdmins } = require('./functions/setAdminRole');

// Lista de emails a hacer admin
const adminEmails = [
  'aletsdesignn@gmail.com',
  'isaacramirez@whapy.com',
  'dylana@whapy.com'
];

// Ejecutar el script
setMultipleAdmins(adminEmails)
  .then(() => {
    console.log('¡Proceso completado!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 