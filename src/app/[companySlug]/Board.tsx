'use client';

import React, { useEffect } from 'react';

export default function Board({ drawnBalls, game }: { drawnBalls: number[], game?: Record<string, unknown> }) {
  // Polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Parse the pattern if it's JSON
  let patternGrid: number[][] | null = null;
  if (game?.winning_pattern && String(game.winning_pattern).startsWith('[')) {
    try {
      patternGrid = JSON.parse(String(game.winning_pattern));
    } catch(e) {}
  }

  // Horizontal BEANO-style layout
  const rows = [
    { letter: 'B', start: 1, end: 15 },
    { letter: 'I', start: 16, end: 30 },
    { letter: 'N', start: 31, end: 45 },
    { letter: 'G', start: 46, end: 60 },
    { letter: 'O', start: 61, end: 75 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', height: '100%' }}>
      
      {/* 75 Number Grid */}
      <div className="glass-panel" style={{ padding: '20px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map(row => (
            <div key={row.letter} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '900',
                color: 'var(--primary)',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                borderRight: '4px solid var(--primary)'
              }}>
                {row.letter}
              </div>
              <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                {Array.from({ length: 15 }).map((_, i) => {
                  const num = row.start + i;
                  const isDrawn = drawnBalls.includes(num);
                  return (
                    <div 
                      key={num} 
                      className={`bingo-ball ${isDrawn ? 'active' : ''}`}
                      style={{ 
                        width: 'calc(100% / 16)', 
                        aspectRatio: '1/1', 
                        fontSize: '1.5rem',
                        margin: '0 2px'
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

      {/* Info Section (Bottom) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        {/* Left: Game Details */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '1.5rem' }}>Información del Juego</h2>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
            {game?.series && <div><strong style={{color: '#94a3b8'}}>Serie:</strong> {String(game.series)}</div>}
            {game?.bonus_pattern && <div><strong style={{color: '#94a3b8'}}>Bonus:</strong> {String(game.bonus_pattern)}</div>}
            {game?.reintegro_pattern && <div><strong style={{color: '#94a3b8'}}>Reintegro:</strong> {String(game.reintegro_pattern)}</div>}
            <div style={{ marginTop: '20px' }}>
              <strong style={{color: '#94a3b8'}}>Total Balotas Cantadas:</strong> <span style={{fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold'}}>{drawnBalls.length}</span>
            </div>
          </div>
        </div>

        {/* Center: Previous Balls */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>Últimas Jugadas</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {drawnBalls.slice(-6, -1).reverse().map((b, i) => (
              <div key={i} className="bingo-ball active" style={{ width: '50px', height: '50px', fontSize: '1.2rem', opacity: 0.8 - (i * 0.1) }}>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Figura en Juego */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ color: '#10b981', marginBottom: '15px', fontSize: '1.5rem' }}>Figura en Juego</h3>
          {patternGrid ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              width: '100%',
              maxWidth: '200px',
              aspectRatio: '1/1',
              background: 'rgba(0,0,0,0.5)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              {patternGrid.map((row, rIdx) => (
                row.map((cell, cIdx) => (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      background: cell === 1 ? '#10b981' : '#1e293b',
                      borderRadius: '4px',
                      border: '1px solid #064e3b',
                      boxShadow: cell === 1 ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                    }}
                  />
                ))
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '1.5rem', color: '#10b981', textAlign: 'center', marginTop: '20px' }}>
              {game?.winning_pattern === 'llena' ? 'CARTÓN LLENO' : 'FIGURAS'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
