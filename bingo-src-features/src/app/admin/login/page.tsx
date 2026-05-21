import sql from '@/lib/db';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  let companies: Record<string, unknown>[] = [];
  try {
    companies = await sql`SELECT id, name, logo_url FROM companies ORDER BY id ASC`;
  } catch (error) {
    console.error("DB Error:", error);
    return <div>Error conectando a la base de datos PostgreSQL.</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)'
    }}>
      <LoginForm companies={companies} />
    </div>
  );
}
