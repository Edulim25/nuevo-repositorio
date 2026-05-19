'use server';

import sql from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function startGame(companyId: number, pattern: string, targetCardId?: number, targetBall?: number) {
  await sql`
    INSERT INTO games (company_id, status, winning_pattern, target_winning_card_id, target_winning_ball_number) 
    VALUES (${companyId}, 'active', ${pattern}, ${targetCardId || null}, ${targetBall || null})
  `;
  revalidatePath('/admin');
}

export async function drawBall(gameId: number) {
  const games = await sql`SELECT * FROM games WHERE id = ${gameId}`;
  const game = games[0];
  if (!game) return { error: 'Game not found' };

  const drawnBalls = await sql`SELECT number FROM balls WHERE game_id = ${gameId}`;
  const drawnNumbers = drawnBalls.map((b: any) => b.number);
  
  const pool = Array.from({length: 75}, (_, i) => i + 1).filter(n => !drawnNumbers.includes(n));
  if (pool.length === 0) return { error: 'No more balls' };

  let nextBall = null;

  if (game.target_winning_card_id && game.target_winning_ball_number && game.winning_pattern === 'llena') {
    const targetCards = await sql`SELECT numbers_json FROM cards WHERE id = ${game.target_winning_card_id}`;
    const targetCard = targetCards[0];
    if (targetCard) {
      const cardGrid = JSON.parse(targetCard.numbers_json);
      const cardNumbers = cardGrid.flat().filter((n: number) => n !== 0); 
      
      const cardNumbersDrawn = cardNumbers.filter((n: number) => drawnNumbers.includes(n));
      const cardNumbersRemaining = cardNumbers.filter((n: number) => !drawnNumbers.includes(n));
      
      const currentDrawIndex = drawnNumbers.length + 1;
      const targetDrawIndex = game.target_winning_ball_number;

      if (currentDrawIndex === targetDrawIndex) {
        if (cardNumbersRemaining.length > 0) {
          nextBall = cardNumbersRemaining[Math.floor(Math.random() * cardNumbersRemaining.length)];
        }
      } else if (currentDrawIndex < targetDrawIndex) {
        const drawsLeftBeforeWin = (targetDrawIndex - 1) - drawnNumbers.length;
        const cardNumbersNeededBeforeWin = cardNumbersRemaining.length - 1;

        if (cardNumbersNeededBeforeWin > 0) {
          const prob = cardNumbersNeededBeforeWin / drawsLeftBeforeWin;
          if (Math.random() < prob || drawsLeftBeforeWin <= cardNumbersNeededBeforeWin) {
            nextBall = cardNumbersRemaining[Math.floor(Math.random() * cardNumbersRemaining.length)];
          }
        }
        
        if (!nextBall) {
          const garbagePool = pool.filter(n => !cardNumbers.includes(n));
          if (garbagePool.length > 0) {
            nextBall = garbagePool[Math.floor(Math.random() * garbagePool.length)];
          }
        }
      }
    }
  }

  if (!nextBall) {
    nextBall = pool[Math.floor(Math.random() * pool.length)];
  }

  await sql`INSERT INTO balls (game_id, number) VALUES (${gameId}, ${nextBall})`;
  revalidatePath('/admin');
  return { success: true, ball: nextBall };
}

function getRandomNumbers(min: number, max: number, count: number) {
  const nums = new Set<number>();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(nums);
}

export async function generateCards(gameId: number, count: number) {
  const newCards = [];
  for (let i = 0; i < count; i++) {
    const b = getRandomNumbers(1, 15, 5);
    const i_col = getRandomNumbers(16, 30, 5);
    const n = getRandomNumbers(31, 45, 5);
    n[2] = 0; // FREE SPACE
    const g = getRandomNumbers(46, 60, 5);
    const o = getRandomNumbers(61, 75, 5);

    const grid = [
      [b[0], i_col[0], n[0], g[0], o[0]],
      [b[1], i_col[1], n[1], g[1], o[1]],
      [b[2], i_col[2], n[2], g[2], o[2]], 
      [b[3], i_col[3], n[3], g[3], o[3]],
      [b[4], i_col[4], n[4], g[4], o[4]],
    ];
    newCards.push({ game_id: gameId, player_name: `Cartón ${i + 1}`, numbers_json: JSON.stringify(grid) });
  }

  // Insert in chunks or just use postgres multi-insert
  await sql`INSERT INTO cards ${sql(newCards, 'game_id', 'player_name', 'numbers_json')}`;
  
  revalidatePath('/admin');
}

export async function endGame(gameId: number) {
  await sql`UPDATE games SET status = 'finished' WHERE id = ${gameId}`;
  revalidatePath('/admin');
}
