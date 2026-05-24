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
    { label: 'B', start: 1, end: 15, color: '#3b82f6' },
    { label: 'I', start: 16, end: 30, color: '#ef4444' },
    { label: 'N', start: 31, end: 45, color: '#f59e0b' },
    { label: 'G', start: 46, end: 60, color: '#10b981' },
    { label: 'O', start: 61, end: 75, color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', gap: '20px' }}>
      
      {/* 75 Number Grid (Top Half) */}
      <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {rows.map((row, rIdx) => (
          <div key={rIdx} style={{ display: 'flex', gap: '15px', flex: 1 }}>
            {/* Letter Badge */}
            <div style={{
              width: '8%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4vw',
              fontWeight: 900,
              background: row.color,
              color: 'white',
              borderRadius: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              boxShadow: `0 4px 15px ${row.color}80, inset 0 2px 5px rgba(255,255,255,0.4)`
            }}>
              {row.label}
            </div>
            
            {/* 15 Numbers */}
            <div style={{ display: 'flex', flex: 1, gap: '8px' }}>
              {Array.from({ length: 15 }).map((_, i) => {
                const num = row.start + i;
                const isDrawn = drawnBalls.includes(num);
                return (
                  <div 
                    key={num} 
                    className={`board-cell ${isDrawn ? 'active animate-pop' : ''}`}
                    style={{ flex: 1 }}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info Section (Bottom) */}
      <div style={{ display: 'flex', gap: '20px', height: '35vh' }}>
        
        {/* Left Side (Stats & Time) */}
        <div className="glass-panel" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Balotas</div>
            <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--neon-cyan)', lineHeight: 1 }}>
              {drawnBalls.length}
            </div>
          </div>
          
          <div>
            <div style={{ color: 'white', fontSize: '1.5rem' }}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div style={{ color: 'var(--neon-purple)', fontSize: '2.5rem', fontWeight: 800 }}>
              {time}
            </div>
          </div>
        </div>

        {/* Center Side (Última Balota Giant) */}
        <div className="glass-panel" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' }}>
          <div style={{ position: 'absolute', top: '20px', color: 'var(--text-muted)', fontSize: '1.5rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Última Balota
          </div>
          
          {drawnBalls.length > 0 ? (
            <div className="animate-pop neon-pulse" style={{
              width: '25vh',
              height: '25vh',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #ffffff, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(0, 240, 255, 0.5), inset -10px -10px 20px rgba(0,0,0,0.5)',
              border: '4px solid rgba(255,255,255,0.8)'
            }}>
              <div style={{ fontSize: '8vh', fontWeight: 900, color: '#0f172a', textShadow: '0 2px 5px rgba(255,255,255,0.8)' }}>
                {drawnBalls[drawnBalls.length - 1]}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.2)' }}>Esperando inicio...</div>
          )}
        </div>

        {/* Right Side (Figuras en Juego) */}
        <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>
            Figura en Juego
          </div>
          
          {patternGrid ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              width: '60%',
              aspectRatio: '1/1',
              background: 'rgba(0,0,0,0.5)',
              padding: '8px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {patternGrid.map((row, rIdx) => (
                row.map((cell, cIdx) => (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      background: cell === 1 ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      boxShadow: cell === 1 ? '0 0 10px rgba(0,255,136,0.5)' : 'none',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ))
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--neon-green)', textShadow: '0 0 20px rgba(0,255,136,0.4)' }}>
              {game?.winning_pattern === 'llena' ? 'CARTÓN LLENO' : (game?.bonus_pattern || 'MODO LIBRE')}
            </div>
          )}

          <div style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginTop: '20px', textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>
            {game?.winning_pattern !== 'llena' && game?.winning_pattern !== '' ? (game?.bonus_pattern || 'FIGURA') : ''}
          </div>
          
          {game?.reintegro_pattern && (
            <div style={{ color: 'var(--neon-yellow)', fontSize: '1.2rem', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reintegro: {String(game.reintegro_pattern)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
