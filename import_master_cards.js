const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Reading JSON file...");
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cartones_all.json'), 'utf8'));
  console.log(`Loaded ${data.length} cards from JSON.`);

  console.log("Creating master_cards table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS master_cards (
      card_number INT PRIMARY KEY,
      numbers_json JSONB NOT NULL
    )
  `);
  
  await pool.query(`TRUNCATE TABLE master_cards`);

  console.log("Inserting cards...");
  const batchSize = 500;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    let values = [];
    let queryArgs = [];
    let argIndex = 1;
    
    batch.forEach(card => {
      values.push(`($${argIndex}, $${argIndex + 1})`);
      queryArgs.push(card.id, JSON.stringify(card.grid));
      argIndex += 2;
    });

    const query = `
      INSERT INTO master_cards (card_number, numbers_json)
      VALUES ${values.join(', ')}
      ON CONFLICT (card_number) DO NOTHING
    `;
    
    await pool.query(query, queryArgs);
    console.log(`Inserted ${Math.min(i + batchSize, data.length)} / ${data.length}`);
  }

  console.log("Done!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
