import sql from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let companies: Record<string, unknown>[] = [];
  try {
    companies = await sql`SELECT * FROM companies`;
  } catch (error) {
    console.error("No se pudo conectar a la base de datos:", error);
  }

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px', color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0, 240, 255, 0.4)' }}>BINGO PREMIUM</h1>
      <p style={{ marginBottom: '50px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
        Plataforma de Sorteos Automatizada
      </p>

      {companies.length === 0 && (
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '20px' }}>
          La base de datos no está conectada o no tiene empresas. Por favor configure DATABASE_URL.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        {companies.map(company => (
          <Link href={`/${company.slug}`} key={company.id} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ 
              padding: '40px 20px', 
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
              cursor: 'pointer',
              borderTop: `4px solid ${company.primary_color || 'var(--neon-cyan)'}` 
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '15px' }}>{company.name}</h2>
              <span style={{ color: company.primary_color || 'var(--neon-cyan)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Ingresar al Bingo →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
