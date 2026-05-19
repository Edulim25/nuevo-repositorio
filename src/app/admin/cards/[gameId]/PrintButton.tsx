'use client';

import React from 'react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      style={{ 
        padding: '10px 20px', 
        background: '#10b981', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        fontWeight: 'bold' 
      }}
    >
      🖨️ Imprimir Cartones
    </button>
  );
}
