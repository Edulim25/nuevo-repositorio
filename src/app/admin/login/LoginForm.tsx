'use client';

import React, { useState } from 'react';
import { login } from '../auth-actions';
import { useRouter } from 'next/navigation';

export default function LoginForm({ companies }: { companies: Record<string, unknown>[] }) {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedCompany) {
      setError('Selecciona una empresa');
      setLoading(false);
      return;
    }

    const result = await login(Number(selectedCompany), password);
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Error desconocido');
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      width: '100%',
      maxWidth: '400px',
      border: '1px solid var(--border)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--accent)', fontSize: '2rem', marginBottom: '10px' }}>Ingreso Locutor</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Selecciona tu empresa e ingresa tu clave</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(255,0,0,0.1)',
          color: '#ff4444',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255,0,0,0.2)'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Empresa</label>
          <select 
            value={String(selectedCompany)} 
            onChange={(e) => setSelectedCompany(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--background)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: '1rem'
            }}
          >
            {companies.map(c => (
              <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Clave de Acceso</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce tu contraseña"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--background)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: '1rem'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '14px',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
