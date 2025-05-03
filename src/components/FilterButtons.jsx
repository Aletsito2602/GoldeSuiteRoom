import React, { useState } from 'react';

function FilterButtons() {
  const filters = ['Todo', 'AGM', 'Eventos', 'Anuncios', 'Trading'];
  const [activeFilter, setActiveFilter] = useState('Todo');

  const buttonStyle = {
    marginRight: '10px',
    marginBottom: '10px' // Añadir margen inferior para posible wrapping
    // Los estilos de gradiente/borde vienen de index.css
  };

  const activeButtonStyle = {
    ...buttonStyle, // Hereda estilos base
    borderColor: '#D7B615' // Borde dorado para el activo
  };

  const inactiveButtonStyle = {
    ...buttonStyle,
    borderColor: '#444', // Borde sutil para inactivos
    background: '#353535' // Fondo más plano para inactivos
  };

  return (
    <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #353535' }}>
      {filters.map((filter) => (
        <button 
          key={filter} 
          onClick={() => setActiveFilter(filter)}
          style={filter === activeFilter ? activeButtonStyle : inactiveButtonStyle}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons; 