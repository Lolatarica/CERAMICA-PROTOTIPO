// src/components/BotonPrincipal.jsx
import React, { useState } from 'react';

function BotonPrincipal({ text, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonStyle = {
    width: '100%',
    padding: '15px',
    backgroundColor: 'var(--color-marron-oscuro)',
    color: 'var(--color-blanco)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.35)' : '0 4px 6px rgba(0,0,0,0.3)',
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Efecto suave
    marginTop: '20px'
  };

  return (
    <button
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}>
      {text}
    </button>
  );
}

export default BotonPrincipal;