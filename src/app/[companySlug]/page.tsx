import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import Board from './Board';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    companySlug: string;
  }>;
}

export default async function CompanyPage({ params }: PageProps) {
  const { companySlug } = await params;
  
  const companies = await sql`SELECT * FROM companies WHERE slug = ${companySlug}`;
  const company = companies[0];
  
  if (!company) {
    notFound();
  }

  // Get current active game for this company, if any
  const games = await sql`SELECT * FROM games WHERE company_id = ${company.id} AND status = 'active' ORDER BY id DESC LIMIT 1`;
  const game = games[0];

  // Get drawn balls for the active game
  let drawnBalls: number[] = [];
  if (game) {
    const balls = await sql`SELECT number FROM balls WHERE game_id = ${game.id} ORDER BY drawn_at ASC`;
    drawnBalls = balls.map((b: any) => b.number);
  }

  // Inline CSS variable injection for the company color theme
  const themeStyle = {
    '--primary': company.primary_color,
  } as React.CSSProperties;

  return (
    <div style={themeStyle} className="min-h-full w-full p-8">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {company.name}
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>
            {game ? `Juego en curso: ${game.winning_pattern === 'figuras' ? 'Por Figuras' : 'Cartón Lleno'}` : 'Esperando próximo juego...'}
          </p>
        </div>
        
        {drawnBalls.length > 0 && (
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', minWidth: '150px' }}>
            <h3 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '10px' }}>Última Balota</h3>
            <div className="bingo-ball active animate-pop" style={{ margin: '0 auto', width: '80px', height: '80px', fontSize: '36px' }}>
              {drawnBalls[drawnBalls.length - 1]}
            </div>
          </div>
        )}
      </header>

      <main>
        <Board drawnBalls={drawnBalls} />
      </main>
    </div>
  );
}
