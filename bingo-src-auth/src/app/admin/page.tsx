import sql from '@/lib/db';
import AdminClient from './AdminClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get('bingo_admin_company_id')?.value;

  if (!companyId) {
    redirect('/admin/login');
  }

  let companies: Record<string, unknown>[] = [];
  let games: Record<string, unknown>[] = [];
  
  try {
    // Only fetch the specific company
    companies = await sql`SELECT * FROM companies WHERE id = ${Number(companyId)} LIMIT 1`;
    
    if (companies.length === 0) {
      // Invalid cookie or company deleted
      cookieStore.delete('bingo_admin_company_id');
      redirect('/admin/login');
    }

    // Only fetch games for this specific company
    games = await sql`SELECT * FROM games WHERE company_id = ${Number(companyId)} ORDER BY id DESC LIMIT 20`;
  } catch (error) {
    console.error("DB Error:", error);
    return <div>Error conectando a la base de datos PostgreSQL. Verifica DATABASE_URL.</div>;
  }
  
  const activeGames = [];
  for (const g of games.filter((g: Record<string, unknown>) => g.status === 'active')) {
    const ballsCountResult = await sql`SELECT COUNT(*) as count FROM balls WHERE game_id = ${g.id as number}`;
    const cardsCountResult = await sql`SELECT COUNT(*) as count FROM cards WHERE game_id = ${g.id as number}`;
    
    activeGames.push({
      ...g,
      ballsCount: Number(ballsCountResult[0].count),
      cardsCount: Number(cardsCountResult[0].count)
    });
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)', margin: 0 }}>Panel Locutor: {String(companies[0].name)}</h1>
      </div>
      <AdminClient companies={companies} activeGames={activeGames} />
    </div>
  );
}
