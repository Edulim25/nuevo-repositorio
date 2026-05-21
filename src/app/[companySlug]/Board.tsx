'use client';

import React, { useEffect, useState } from 'react';

export default function Board({ drawnBalls, game }: { drawnBalls: number[], game?: Record<string, unknown> }) {
  const [time, setTime] = useState('');

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-ES'));
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Parse the pattern if it's JSON
  let patternGrid: number[][] | null = null;
  if (game?.winning_pattern && String(game.winning_pattern).startsWith('[')) {
    try {
      patternGrid = JSON.parse(String(game.winning_pattern));
    } catch(e) {}
  }

  // Horizontal BEANO-style layout (5 rows of 15)
  const rows = [
    { start: 1, end: 15 },
    { start: 16, end: 30 },
    { start: 31, end: 45 },
    { start: 46, end: 60 },
    { start: 61, end: 75 },
  ];

  // Helper for 3D buttons
  const button3DStyle = {
    background: 'linear-gradient(to bottom, #10b981, #059669)',
    border: '2px solid',
    borderColor: '#34d399 #064e3b #064e3b #34d399',
    color: 'white',
    fontWeight: 'bold',
    padding: '4px 8px',
    boxShadow: '1px 1px 3px rgba(0,0,0,0.5)',
    textShadow: '1px 1px 1px black'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 75 Number Grid (Top Half) */}
      <div style={{ background: '#d4d0c8', padding: '5px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', border: '2px solid #808080', padding: '2px', background: 'white' }}>
          {rows.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', gap: '2px' }}>
              {/* Blank square on the left (as in the screenshot) */}
              <div style={{
                width: '40px',
                background: 'white',
                border: '2px outset #dfdfdf',
                boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.1)'
              }}></div>
              
              {/* 15 Numbers */}
              <div style={{ display: 'flex', flex: 1, gap: '2px' }}>
                {Array.from({ length: 15 }).map((_, i) => {
                  const num = row.start + i;
                  const isDrawn = drawnBalls.includes(num);
                  return (
                    <div 
                      key={num} 
                      style={{ 
                        flex: 1, 
                        aspectRatio: '1/1', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3vw', // Scale text dynamically
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                        borderRadius: '50%',
                        background: isDrawn ? '#ffff00' : '#e0e0e0', // Yellow if drawn, grey if not
                        color: 'black',
                        borderTop: '2px solid #ffffff',
                        borderLeft: '2px solid #ffffff',
                        borderRight: '2px solid #a0a0a0',
                        borderBottom: '2px solid #a0a0a0',
                        boxShadow: isDrawn ? 'inset 1px 1px 0px white, inset -1px -1px 0px #808080' : 'inset 2px 2px 5px white, inset -2px -2px 5px #808080'
                      }}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider Bar (Middle) */}
      <div style={{ 
        height: '30px', 
        background: '#a3a3a3', // Fallback for brick texture
        backgroundImage: 'repeating-linear-gradient(45deg, #cc6666 25%, transparent 25%, transparent 75%, #cc6666 75%, #cc6666), repeating-linear-gradient(45deg, #cc6666 25%, #e6e6e6 25%, #e6e6e6 75%, #cc6666 75%, #cc6666)',
        backgroundPosition: '0 0, 10px 10px',
        backgroundSize: '20px 20px',
        borderTop: '2px solid #ffffff',
        borderBottom: '2px solid #808080',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: '10px'
      }}>
        {/* Mock Windows info bar items */}
        <div style={{ background: '#7b8cf6', color: 'white', padding: '2px 10px', border: '1px solid blue', fontSize: '12px' }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ background: '#7b8cf6', color: 'white', padding: '2px 10px', border: '1px solid blue', fontSize: '12px' }}>
          {time}
        </div>
        <div style={{ ...button3DStyle as any, marginLeft: 'auto', fontSize: '12px' }}>Siguiente jugada</div>
      </div>

      {/* Info Section (Bottom) */}
      <div style={{ display: 'flex', flex: 1, background: '#dccba8', borderTop: '2px solid white' }}>
        
        {/* Left Side (Controls/Previous) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '2px solid #808080' }}>
          <div style={{ display: 'flex', padding: '10px', gap: '10px' }}>
            <div style={button3DStyle as any}>Jugadas anteriores</div>
            <div style={{ display: 'flex' }}>
              <div style={{ ...button3DStyle as any, padding: '2px 15px' }}>{'<'}</div>
              <div style={{ ...button3DStyle as any, padding: '2px 15px' }}>{'>'}</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '10px', display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={button3DStyle as any}>Contador</div>
              <div style={{ background: 'white', border: '2px inset #808080', padding: '5px 20px', fontSize: '2rem', fontWeight: 'bold', color: 'green', marginTop: '5px' }}>
                {drawnBalls.length}
              </div>
            </div>
            <div>
               <div style={button3DStyle as any}>Balotas finales</div>
            </div>
          </div>
        </div>

        {/* Center Side (Ultima/Video) */}
        <div style={{ flex: 1.5, background: 'black', borderLeft: '2px solid white', borderRight: '2px solid #808080', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ position: 'absolute', top: '-15px', left: '10px', ...button3DStyle as any }}>Ultima</div>
           {drawnBalls.length > 0 && (
             <div style={{
               width: '150px',
               height: '150px',
               borderRadius: '50%',
               background: 'radial-gradient(circle at 30% 30%, #ffffff, #888888)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               boxShadow: '5px 5px 15px rgba(0,0,0,0.8)'
             }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                 {drawnBalls[drawnBalls.length - 1]}
               </div>
             </div>
           )}
        </div>

        {/* Right Side (Figuras en Juego) */}
        <div style={{ width: '300px', background: 'black', borderLeft: '2px solid white', borderTop: '2px solid #808080', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 10px' }}>
          <div style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px', fontFamily: 'Arial, sans-serif' }}>Figuras en Juego</div>
          
          {patternGrid && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '2px',
              width: '100%',
              aspectRatio: '1/1',
              background: '#00cc00', // Green borders
              padding: '2px',
              border: '2px solid #00cc00'
            }}>
              {patternGrid.map((row, rIdx) => (
                row.map((cell, cIdx) => (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      background: cell === 1 ? '#ff0000' : 'transparent', // Red fill or nothing
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ))
              ))}
            </div>
          )}

          <div style={{ color: '#00ff00', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '10px', textAlign: 'center' }}>
            {game?.winning_pattern === 'llena' ? 'Cartón Lleno' : (game?.bonus_pattern || 'Figura')}
          </div>
          <div style={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '5px' }}>
            $ 0
          </div>
          {game?.reintegro_pattern && (
            <div style={{ color: '#ffff00', fontSize: '1rem', marginTop: '10px' }}>
              Reintegro: {String(game.reintegro_pattern)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
