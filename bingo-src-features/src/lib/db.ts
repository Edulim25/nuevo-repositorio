import postgres from 'postgres';

// Si no hay DATABASE_URL, lanzamos un error claro para el desarrollador.
if (!process.env.DATABASE_URL) {
  console.warn("ADVERTENCIA: No se encontró DATABASE_URL. Asegúrate de configurarlo en Vercel o en un archivo .env.local");
}

const sql = postgres(process.env.DATABASE_URL || '', { 
  ssl: 'require',
  max: 10 // Max connections
});

export default sql;
