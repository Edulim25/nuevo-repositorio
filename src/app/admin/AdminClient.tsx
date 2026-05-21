'use client';

import React, { useState } from 'react';
import { startGame, drawBall, endGame, generateCards, drawSpecificBall, undoLastBall } from './actions';
import { logout } from './auth-actions';
import PatternSelector from './PatternSelector';

export default function AdminClient({ companies, activeGames }: { companies: Record<string, unknown>[], activeGames: Record<string, unknown>[] }) {
  const company = companies[0];
  const selectedCompany = company?.id;
  const [pattern, setPattern] = useState('[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]');
  const [targetCardId, setTargetCardId] = useState('');
  const [targetBall, setTargetBall] = useState('');
  const [series, setSeries] = useState('');
  const [bonusPattern, setBonusPattern] = useState('');
  const [reintegroPattern, setReintegroPattern] = useState('');

  const [cardsCount, setCardsCount] = useState(100);
  const [printRanges, setPrintRanges] = useState<Record<number, {start: number, end: number}>>({});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
      
      {/* Control Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Nuevo Juego</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Empresa</label>
            <button 
              onClick={() => logout()}
              style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cerrar Sesión
            </button>
          </div>
          <div style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#334155', color: 'white', border: 'none', fontWeight: 'bold' }}>
            {String(company?.name)}
          </div>
        </div>

        <PatternSelector value={pattern} onChange={setPattern} />

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Serie (Opcional)</label>
          <input type="text" placeholder="Ej: Serie A, VIP..." value={series} onChange={e => setSeries(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#334155', color: 'white', border: 'none' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Bonus (Opcional)</label>
          <input type="text" placeholder="Ej: Cuatro Esquinas" value={bonusPattern} onChange={e => setBonusPattern(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#334155', color: 'white', border: 'none' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Reintegro (Opcional)</label>
          <input type="text" placeholder="Ej: Letra L" value={reintegroPattern} onChange={e => setReintegroPattern(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#334155', color: 'white', border: 'none' }} />
        </div>

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
              isNaN(bNum) ? undefined : bNum,
              series,
              bonusPattern,
              reintegroPattern
            );
            setTargetCardId('');
            setTargetBall('');
            setSeries('');
            setBonusPattern('');
            setReintegroPattern('');
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
                    <p style={{ margin: 0, color: '#94a3b8' }}>Modo: Figura Personalizada | Balotas cantadas: {game.ballsCount}</p>
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
                  <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981' }}>
                    <h4 style={{ color: '#10b981', marginBottom: '10px' }}>Imprimir Cartones</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.9rem' }}>Desde N°:</label>
                      <input 
                        type="number" 
                        value={printRanges[game.id as number]?.start || 1} 
                        onChange={e => setPrintRanges({...printRanges, [game.id as number]: {...printRanges[game.id as number], start: Number(e.target.value)}})} 
                        style={{ width: '80px', padding: '8px', borderRadius: '4px', background: '#1e293b', color: 'white', border: '1px solid #475569' }} 
                        min={1}
                      />
                      <label style={{ fontSize: '0.9rem' }}>Hasta N°:</label>
                      <input 
                        type="number" 
                        value={printRanges[game.id as number]?.end || game.cardsCount} 
                        onChange={e => setPrintRanges({...printRanges, [game.id as number]: {...printRanges[game.id as number], end: Number(e.target.value)}})} 
                        style={{ width: '80px', padding: '8px', borderRadius: '4px', background: '#1e293b', color: 'white', border: '1px solid #475569' }} 
                        max={game.cardsCount as number}
                      />
                    </div>
                    <a href={`/admin/cards/${game.id}?start=${printRanges[game.id as number]?.start || 1}&end=${printRanges[game.id as number]?.end || game.cardsCount}`} target="_blank" rel="noreferrer">
                      <button className="btn" style={{ background: '#10b981', width: '100%' }}>🖨️ Ver / Imprimir Rango Seleccionado</button>
                    </a>
                  </div>
                )}
                
                <div style={{ background: '#d4d0c8', padding: '15px', borderRadius: '8px', border: '2px solid #808080' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: 'black' }}>Tablero de Control Manual</h4>
                    <button 
                      className="btn" 
                      style={{ background: '#ef4444', padding: '8px 15px', fontSize: '0.9rem' }}
                      onClick={async () => {
                        await undoLastBall(game.id as number);
                      }}
                    >
                      ⏪ Deshacer Última Balota
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '4px' }}>
                    {Array.from({ length: 75 }).map((_, i) => {
                      const num = i + 1;
                      const drawnBalls = (game.drawnBalls as number[]) || [];
                      const isDrawn = drawnBalls.includes(num);
                      return (
                        <button
                          key={num}
                          onClick={async () => {
                            if (!isDrawn) {
                              await drawSpecificBall(game.id as number, num);
                            }
                          }}
                          style={{
                            aspectRatio: '1/1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            borderRadius: '50%',
                            background: isDrawn ? '#ffff00' : '#ffffff',
                            color: 'black',
                            borderTop: '2px solid #ffffff',
                            borderLeft: '2px solid #ffffff',
                            borderRight: '2px solid #a0a0a0',
                            borderBottom: '2px solid #a0a0a0',
                            cursor: isDrawn ? 'default' : 'pointer',
                            opacity: isDrawn ? 1 : 0.9,
                            boxShadow: isDrawn ? 'inset 1px 1px 2px rgba(0,0,0,0.3)' : 'inset 2px 2px 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  );
}
