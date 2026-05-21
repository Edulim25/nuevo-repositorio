'use client';

import React, { useState, useEffect } from 'react';
import { beanoPatterns } from './beanoPatterns';

interface PatternSelectorProps {
  value: string; // The JSON string of the 5x5 grid
  onChange: (value: string) => void;
}

export default function PatternSelector({ value, onChange }: PatternSelectorProps) {
  // Parse initial value or create a blank 5x5 grid
  const initialGrid = () => {
    try {
      if (value.startsWith('[')) {
        return JSON.parse(value);
      }
    } catch (e) {
      // ignore
    }
    return Array(5).fill(Array(5).fill(0));
  };

  const [grid, setGrid] = useState<number[][]>(initialGrid);

  // Sync back to parent when grid changes
  useEffect(() => {
    onChange(JSON.stringify(grid));
  }, [grid, onChange]);

  const toggleCell = (row: number, col: number) => {
    const newGrid = grid.map((r, rIdx) => 
      r.map((c, cIdx) => {
        if (rIdx === row && col === cIdx) {
          return c === 1 ? 0 : 1;
        }
        return c;
      })
    );
    setGrid(newGrid);
  };

  const setPreset = (preset: 'figuras' | 'llena') => {
    if (preset === 'llena') {
      setGrid(Array(5).fill(Array(5).fill(1)));
    } else {
      setGrid(Array(5).fill(Array(5).fill(0)));
    }
  };

  const handlePatternSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patternName = e.target.value;
    if (!patternName) return;
    const selected = beanoPatterns.find((p: any) => p.name === patternName);
    if (selected) {
      setGrid(selected.grid);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '10px' }}>Representación Gráfica (Figura a Jugar)</label>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 40px)',
          gridTemplateRows: 'repeat(5, 40px)',
          gap: '2px',
          background: '#0f172a',
          padding: '5px',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          {grid.map((row, rIdx) => (
            row.map((cell, cIdx) => (
              <div 
                key={`${rIdx}-${cIdx}`}
                onClick={() => toggleCell(rIdx, cIdx)}
                style={{
                  background: cell === 1 ? '#3b82f6' : '#1e293b',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid #475569',
                  transition: 'background 0.2s'
                }}
              />
            ))
          ))}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select 
            onChange={handlePatternSelect}
            style={{ padding: '8px', background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '4px' }}
          >
            <option value="">-- Cargar Figura Clásica --</option>
            {beanoPatterns.map((p: any, idx: number) => (
              <option key={idx} value={p.name}>{p.name}</option>
            ))}
          </select>
          
          <button type="button" onClick={() => setPreset('llena')} style={{ padding: '8px 15px', background: '#334155', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cartón Lleno
          </button>
          <button type="button" onClick={() => setPreset('figuras')} style={{ padding: '8px 15px', background: '#334155', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Limpiar Cuadrícula
          </button>
        </div>
      </div>
    </div>
  );
}
