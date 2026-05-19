import sql from '@/lib/db';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  let companies: any[] = [];
  let games: any[] = [];
  
  try {
    companies = await sql`SELECT * FROM companies`;
    games = await sql`SELECT * FROM games ORDER BY id DESC LIMIT 20`;
  } catch (error) {
    console.error("DB Error:", error);
    return <div>Error conectando a la base de datos PostgreSQL. Verifica DATABASE_URL.</div>;
  }
  
  const activeGames = [];
  for (const g of games.filter((g: any) => g.status === 'active')) {
    const ballsCountResult = await sql`SELECT COUNT(*) as count FROM balls WHERE game_id = ${g.id}`;
    const cardsCountResult = await sql`SELECT COUNT(*) as count FROM cards WHERE game_id = ${g.id}`;
    
    activeGames.push({
      ...g,
      ballsCount: Number(ballsCountResult[0].count),
      cardsCount: Number(cardsCountResult[0].count)
    });
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--accent)' }}>Panel de Administrador (Locutor)</h1>
      <AdminClient companies={companies} activeGames={activeGames} />
    </div>
  );
}
