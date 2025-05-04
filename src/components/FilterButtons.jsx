import React from 'react';

// Estilos básicos en línea, se pueden mover a CSS si se prefiere
const buttonContainerStyle = {
  marginBottom: '20px',
  display: 'flex',
  flexWrap: 'wrap', // Permite que los botones pasen a la siguiente línea si no caben
  gap: '10px' // Espacio entre botones
};

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '20px', // Bordes redondeados
  border: '1px solid #555', // Borde sutil
  backgroundColor: '#333', // Fondo oscuro
  color: '#eee', // Texto claro
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const activeButtonStyle = {
  ...buttonStyle,
  borderColor: '#D7B615', // Borde dorado para el activo
  color: '#D7B615'
  // backgroundColor: '#444' // Opcional: ligero cambio de fondo para activo
};

// TODO: Implementar lógica de filtrado real si es necesario
function FilterButtons({ activeCategory, onCategoryChange }) { 
  // Definir los filtros disponibles aquí
  const filters = ['General', 'Anuncios'];

  return (
    <div style={buttonContainerStyle}>
      {filters.map(filter => (
        <button 
          key={filter}
          // Determinar el estilo basado en si es el filtro activo
          style={activeCategory === filter ? activeButtonStyle : buttonStyle} 
          // Llamar a la función onCategoryChange cuando se hace clic
          onClick={() => onCategoryChange ? onCategoryChange(filter) : console.log(`Filter selected: ${filter}`)} 
        >
          {filter} 
        </button>
      ))}
    </div>
  );
}

export default FilterButtons; 