require('dotenv').config({ path: '.env' });
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function main() {
  console.log("Reading cartones...");
  const rawData = fs.readFileSync(path.join(__dirname, '../cartones_all.json'), 'utf8').replace(/^\uFEFF/, '');
  const data = JSON.parse(rawData);

  console.log("Creating table...");
  await sql`CREATE TABLE IF NOT EXISTS master_cards (card_number INT PRIMARY KEY, numbers_json JSONB NOT NULL)`;
  await sql`TRUNCATE TABLE master_cards`;

  console.log(`Uploading ${data.length} cards in batches...`);
  const batchSize = 1000;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Prepare the rows for postgres.js multi-insert
    const rows = batch.map(c => ({
      card_number: c.id,
      numbers_json: JSON.stringify(c.grid)
    }));

    await sql`INSERT INTO master_cards ${sql(rows)} ON CONFLICT (card_number) DO NOTHING`;
    console.log(`Inserted ${Math.min(i + batchSize, data.length)} / ${data.length}`);
  }

  console.log("Upload Complete!");
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
