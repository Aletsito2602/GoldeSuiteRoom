import React from 'react';
import SectionHeader from '../components/SectionHeader';

function AboutPage() {
  return (
    <div className="about-page">
      <SectionHeader title="Acerca de Mi Legado" />
      
      <div style={{ 
        backgroundColor: '#353535', 
        borderRadius: '20px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#D7B615', marginBottom: '15px' }}>Nuestra Misión</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
          Mi Legado es una plataforma diseñada para crear una comunidad de aprendizaje y crecimiento personal.
          Nuestro objetivo es proporcionar un espacio donde puedas conectar con otros miembros, 
          acceder a contenido educativo de calidad y desarrollar tus habilidades.
        </p>
        
        <h2 style={{ color: '#D7B615', marginBottom: '15px', marginTop: '30px' }}>Características</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Comunidad:</strong> Comparte ideas, haz preguntas y conecta con otros miembros.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Clases:</strong> Accede a lecciones y cursos estructurados para mejorar tus conocimientos.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Streaming:</strong> Disfruta de transmisiones en vivo y contenido de video bajo demanda.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Anuncios:</strong> Mantente informado sobre las últimas novedades y actualizaciones.
          </li>
        </ul>
        
        <h2 style={{ color: '#D7B615', marginBottom: '15px', marginTop: '30px' }}>Contacto</h2>
        <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
          Si tienes alguna pregunta, sugerencia o necesitas ayuda, no dudes en contactar con nuestro equipo de soporte:
        </p>
        <p style={{ marginBottom: '5px' }}>
          <strong>Email:</strong> soporte@milegado.com
        </p>
        <p>
          <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#353535', 
        borderRadius: '20px', 
        padding: '20px'
      }}>
        <h2 style={{ color: '#D7B615', marginBottom: '15px' }}>Versión de la aplicación</h2>
        <p>Mi Legado v1.0.0</p>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '10px' }}>
          © 2023 Mi Legado. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}

export default AboutPage; 