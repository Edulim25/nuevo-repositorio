'use client';

import React, { useEffect, useState } from 'react';

export default function Board({ drawnBalls }: { drawnBalls: number[] }) {
  const letters = ['B', 'I', 'N', 'G', 'O'];
  
  // Real-time refresh placeholder: In a production app, we'd use Server-Sent Events or WebSockets.
  // For now, we poll every 2 seconds to refresh the page (or fetch an API) to get the latest balls.
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 5000); // 5 seconds polling for simplicity in V1
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
        {/* Headers */}
        {letters.map((letter) => (
          <div key={letter} style={{ 
            textAlign: 'center', 
            fontSize: '3rem', 
            fontWeight: '900', 
            color: 'var(--primary)',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            marginBottom: '20px'
          }}>
            {letter}
          </div>
        ))}

        {/* Numbers Grid */}
        {Array.from({ length: 15 }).map((_, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {letters.map((_, colIndex) => {
              const num = colIndex * 15 + rowIndex + 1;
              const isDrawn = drawnBalls.includes(num);
              
              return (
                <div key={num} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className={`bingo-ball ${isDrawn ? 'active' : ''}`}>
                    {num}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
