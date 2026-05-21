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

  return (
    <div style={{ backgroundColor: '#d4d0c8', minHeight: '100vh', width: '100%', fontFamily: 'Arial, sans-serif' }}>
      {/* Top Banner similar to BEANO window header could go here, or just simple */}
      <div style={{ padding: '5px 10px', background: '#e5e5e5', borderBottom: '2px solid #808080', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 'bold', letterSpacing: '2px' }}>BEANO - {company.name.toUpperCase()}</div>
      </div>
      
      <main style={{ padding: '10px' }}>
        <Board drawnBalls={drawnBalls} game={game} />
      </main>
    </div>
  );
}
