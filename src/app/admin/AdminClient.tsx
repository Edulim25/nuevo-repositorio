'use client';

import React, { useState } from 'react';
import { startGame, drawBall, endGame, generateCards } from './actions';

export default function AdminClient({ companies, activeGames }: { companies: any[], activeGames: any[] }) {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '');
  const [pattern, setPattern] = useState('figuras');
  const [targetCardId, setTargetCardId] = useState('');
  const [targetBall, setTargetBall] = useState('');

  const [cardsCount, setCardsCount] = useState(100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
      
      {/* Control Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Nuevo Juego</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Empresa</label>
          <select 
            value={selectedCompany} 
            onChange={e => setSelectedCompany(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#334155', color: 'white', border: 'none' }}
          >
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Modo de Juego</label>
          <select 
            value={pattern} 
            onChange={e => setPattern(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#334155', color: 'white', border: 'none' }}
          >
            <option value="figuras">Figuras</option>
            <option value="llena">Cartón Lleno (Llena)</option>
          </select>
        </div>

        {pattern === 'llena' && (
          <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,0,0,0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
            <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>Ganador Programado (Opcional)</h4>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9rem' }}>ID del Cartón Ganador:</label>
              <input type="number" placeholder="Ej: 5" value={targetCardId} onChange={e => setTargetCardId(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', background: '#1e293b', color: 'white', border: '1px solid #475569' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.9rem' }}>Ganar exactamente en la balota N°:</label>
              <input type="number" placeholder="Ej: 45" value={targetBall} onChange={e => setTargetBall(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', background: '#1e293b', color: 'white', border: '1px solid #475569' }} />
            </div>
          </div>
        )}

        <button 
          className="btn" 
          style={{ width: '100%' }}
          onClick={async () => {
            const cId = Number(targetCardId);
            const bNum = Number(targetBall);
            await startGame(
              Number(selectedCompany), 
              pattern, 
              isNaN(cId) ? undefined : cId, 
              isNaN(bNum) ? undefined : bNum
            );
            setTargetCardId('');
            setTargetBall('');
          }}
        >
          Iniciar Juego
        </button>
      </div>

      {/* Active Games */}
      <div>
        <h2 style={{ marginBottom: '20px' }}>Juegos Activos</h2>
        {activeGames.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No hay juegos activos en este momento.</p>
        ) : (
          activeGames.map(game => {
            const company = companies.find(c => c.id === game.company_id);
            return (
              <div key={game.id} className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderLeft: `5px solid ${company?.primary_color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{company?.name} (Juego #{game.id})</h3>
                    <p style={{ margin: 0, color: '#94a3b8' }}>Modo: {game.winning_pattern} | Balotas cantadas: {game.ballsCount}</p>
                    <p style={{ margin: 0, color: '#22d3ee' }}>Cartones Generados: {game.cardsCount}</p>
                    {game.target_winning_card_id && (
                      <p style={{ margin: 0, color: '#ef4444', fontSize: '0.9rem' }}>⚠️ Ganador Programado: Cartón {game.target_winning_card_id} en balota {game.target_winning_ball_number}</p>
                    )}
                  </div>
                  <button className="btn" style={{ background: '#ef4444' }} onClick={() => endGame(game.id)}>
                    Terminar Juego
                  </button>
                </div>

                {game.cardsCount === 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <input type="number" value={cardsCount} onChange={e => setCardsCount(Number(e.target.value))} style={{ padding: '10px', borderRadius: '4px', background: '#1e293b', color: 'white', border: '1px solid #475569', width: '100px' }} />
                    <button className="btn" onClick={() => generateCards(game.id, cardsCount)}>Generar Cartones</button>
                  </div>
                )}

                {game.cardsCount > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <a href={`/admin/cards/${game.id}`} target="_blank" rel="noreferrer">
                      <button className="btn" style={{ background: '#10b981' }}>🖨️ Ver / Imprimir Cartones</button>
                    </a>
                  </div>
                )}
                
                <button 
                  className="btn" 
                  style={{ width: '100%', padding: '20px', fontSize: '1.2rem' }}
                  onClick={async () => {
                    await drawBall(game.id);
                  }}
                >
                  SACAR SIGUIENTE BALOTA
                </button>
              </div>
            )
          })
        )}
      </div>

    </div>
  );
}
