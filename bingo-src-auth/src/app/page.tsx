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
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--accent)' }}>Sistemas de Bingo</h1>
      <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#94a3b8' }}>
        Seleccione su empresa para ingresar al sistema
      </p>

      {companies.length === 0 && (
        <div style={{ background: 'rgba(255,0,0,0.2)', padding: '20px', borderRadius: '10px' }}>
          La base de datos no está conectada o no tiene empresas. Por favor configure DATABASE_URL.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {companies.map(company => (
          <Link href={`/${company.slug}`} key={company.id} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ 
              padding: '30px 20px', 
              transition: 'transform 0.2s', 
              cursor: 'pointer',
              borderTop: `4px solid ${company.primary_color}` 
            }}>
              <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '10px' }}>{company.name}</h2>
              <span style={{ color: company.primary_color, fontWeight: 'bold' }}>Ingresar al Bingo →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
