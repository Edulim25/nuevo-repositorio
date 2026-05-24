'use client';

import React, { useState } from 'react';
import { startGame, drawBall, endGame, loadCardsFromMaster, bulkInsertCards, drawSpecificBall, undoLastBall } from './actions';
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
          style={{ width: '100%', marginTop: '10px' }}
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
                  <div className="glass-panel" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <h4 style={{ color: '#34d399', marginBottom: '10px' }}>🖨️ Imprimir Cartones</h4>
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
                      <button className="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>Ver / Imprimir Rango Seleccionado</button>
                    </a>
                  </div>
                )}
                <div>
                {!game.is_finished && (
                  <div className="glass-panel" style={{ marginBottom: '20px', padding: '20px' }}>
                    <h4 style={{ margin: 0, marginBottom: '15px', color: 'var(--neon-cyan)', fontSize: '1.2rem' }}>Jugar con Cartones Físicos</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select 
                        id={`seriesSelect-${game.id}`}
                        style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: 'white' }}
                      >
                        <option value="Srs_A">Serie A</option>
                        <option value="Srs_B">Serie B</option>
                        <option value="Srs_C">Serie C</option>
                        <option value="Srs_D">Serie D</option>
                        <option value="Srs_E">Serie E</option>
                        <option value="Srs_bog">Bogotá</option>
                        <option value="Srs_Yeison">Yeison</option>
                        <option value="Srs_CompuJuegos">CompuJuegos</option>
                        <option value="Srs36000">Serie 36000</option>
                        <option value="SRS_CLO2">CLO2</option>
                        <option value="Srs_Manila">Manila</option>
                        <option value="Srs_BU_Segunda">BU Segunda</option>
                        <option value="Srs_BU_Tercera">BU Tercera</option>
                        <option value="Srs_BU_Cuarta">BU Cuarta</option>
                        <option value="Srs_BU_Quinta">BU Quinta</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="Desde N°" 
                        id={`startRange-${game.id}`}
                        style={{ padding: '8px', width: '80px', borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: 'white' }}
                      />
                      <input 
                        type="number" 
                        placeholder="Hasta N°" 
                        id={`endRange-${game.id}`}
                        style={{ padding: '8px', width: '80px', borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: 'white' }}
                      />
                      <button 
                        className="btn" 
                        onClick={async () => {
                          const series = (document.getElementById(`seriesSelect-${game.id}`) as HTMLSelectElement).value;
                          const start = parseInt((document.getElementById(`startRange-${game.id}`) as HTMLInputElement).value);
                          const end = parseInt((document.getElementById(`endRange-${game.id}`) as HTMLInputElement).value);
                          if (start > 0 && end >= start) {
                            try {
                              const res = await fetch(`/series/${series}.json`);
                              if (!res.ok) {
                                alert("No se encontró el archivo de la serie.");
                                return;
                              }
                              const data = await res.json();
                              const selected = data.filter((c: any) => c.id >= start && c.id <= end);
                              if (selected.length === 0) {
                                alert("No se encontraron cartones en ese rango.");
                                return;
                              }
                              await bulkInsertCards(game.id as number, selected);
                            } catch (e) {
                              alert("Error al cargar la serie.");
                              console.error(e);
                            }
                          } else {
                            alert("Ingresa un rango válido.");
                          }
                        }}
                      >
                        Poner en Juego
                      </button>
                    </div>
                    <p style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>*Carga los cartones pre-impresos para detección automática de ganadores.</p>
                  </div>
                )}  
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '1.2rem' }}>Tablero de Control Manual</h4>
                      <button 
                        className="btn btn-danger" 
                        onClick={async () => {
                          await undoLastBall(game.id as number);
                        }}
                      >
                        ⏪ Deshacer Última Balota
                      </button>
                    </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '8px' }}>
                    {Array.from({ length: 75 }).map((_, i) => {
                      const num = i + 1;
                      const drawnBalls = (game.drawnBalls as number[]) || [];
                      const isDrawn = drawnBalls.includes(num);
                      return (
                        <button
                          key={num}
                          className={`bingo-ball-btn ${isDrawn ? 'active animate-pop' : ''}`}
                          onClick={async () => {
                            if (!isDrawn) {
                              await drawSpecificBall(game.id as number, num);
                            }
                          }}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
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
