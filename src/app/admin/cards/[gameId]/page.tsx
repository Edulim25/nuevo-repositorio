import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ start?: string, end?: string }>;
}

export default async function CardsPage({ params, searchParams }: Props) {
  const { gameId } = await params;
  const { start, end } = await searchParams;
  
  const games = await sql`SELECT * FROM games WHERE id = ${Number(gameId)}`;
  const game = games[0];
  if (!game) return notFound();

  const companies = await sql`SELECT * FROM companies WHERE id = ${game.company_id}`;
  const company = companies[0];

  const cards = await sql`SELECT * FROM cards WHERE game_id = ${game.id} ORDER BY id ASC`;

  // Para cartones generados aleatoriamente, el rango se basa en el índice (1 a N).
  // Para cartones físicos, simplemente usamos todos los que estén en la DB, pero respetamos el slice si es necesario.
  const startIdx = start ? Number(start) - 1 : 0;
  const endIdx = end ? Number(end) : cards.length;
  const rangedCards = cards.slice(Math.max(0, startIdx), Math.min(cards.length, endIdx));

  // Dividir en grupos de 8 para forzar una página A4 por grupo
  const chunkedCards = [];
  for (let i = 0; i < rangedCards.length; i += 8) {
    chunkedCards.push(rangedCards.slice(i, i + 8));
  }

  return (
    <div style={{ background: '#f1f5f9', color: 'black', minHeight: '100vh' }}>
      <div className="no-print" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Link href="/admin">
          <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Volver al Panel</button>
        </Link>
        <PrintButton />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          .no-print { display: none !important; }
          body, html { 
            background: white !important; 
            color: black !important;
            margin: 0; 
            padding: 0; 
          }
          * {
            color: black !important;
          }
          .a4-page {
            width: 190mm;
            height: 277mm; /* A4 height (297) minus 20mm margins */
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0;
            box-shadow: none !important;
          }
        }
        
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          margin: 0 auto 20px auto;
          background: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: repeat(4, 1fr);
          gap: 5mm;
          box-sizing: border-box;
        }

        .card-wrapper {
          border: 1px solid #000;
          display: flex;
          flex-direction: column;
          padding: 2mm;
          box-sizing: border-box;
          height: 100%;
          color: black !important;
        }

        .bingo-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(6, 1fr); /* 1 row header, 5 rows numbers */
          gap: 1px;
          background: black;
          border: 1px solid black;
          flex-grow: 1;
        }

        .bingo-cell {
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          line-height: 1;
        }

        .bingo-header {
          background: #e2e8f0;
          color: black;
          font-size: 22px;
          font-weight: 900;
        }
      `}} />

      <div className="print-container">
        {chunkedCards.map((chunk, pageIndex) => (
          <div key={pageIndex} className="a4-page">
            {chunk.map(card => {
              const grid = JSON.parse(card.numbers_json);
              return (
                <div key={card.id} className="card-wrapper">
                  <div style={{ textAlign: 'center', marginBottom: '4px', lineHeight: '1.2' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
                      {card.player_name && card.player_name.startsWith('Cartón') 
                        ? card.player_name 
                        : `CARTÓN N° ${startIdx + (pageIndex * 8) + chunk.indexOf(card) + 1}`}
                      <span style={{fontSize: '9px', fontWeight: 'normal', marginLeft: '5px'}}>(Ref: {card.id})</span>
                    </div>
                    {game.series && <div style={{ fontSize: '11px', fontWeight: 'bold' }}>SERIE: {String(game.series)}</div>}
                    <div style={{ fontSize: '10px' }}>JUEGA POR: {String(game.winning_pattern)}</div>
                    {game.bonus_pattern && <div style={{ fontSize: '10px' }}>BONUS: {String(game.bonus_pattern)}</div>}
                    {game.reintegro_pattern && <div style={{ fontSize: '10px' }}>REINTEGRO: {String(game.reintegro_pattern)}</div>}
                  </div>
                  
                  <div className="bingo-grid">
                    {['B', 'I', 'N', 'G', 'O'].map(l => (
                      <div key={l} className="bingo-cell bingo-header">{l}</div>
                    ))}
                    
                    {Array.from({length: 5}).map((_, row) => (
                      Array.from({length: 5}).map((_, col) => {
                        const num = grid[row][col];
                        const isCenter = num === 0;
                        return (
                          <div key={`${row}-${col}`} className="bingo-cell" style={isCenter ? { background: '#f8fafc', padding: '2px' } : {}}>
                            {isCenter ? (
                                company.logo_url ? 
                                <img src={company.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> :
                                <span style={{ fontSize: '10px' }}>BINGO</span>
                            ) : num}
                          </div>
                        )
                      })
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
