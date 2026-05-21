'use server';

import sql from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function startGame(companyId: number, pattern: string, targetCardId?: number, targetBall?: number, series?: string, bonusPattern?: string, reintegroPattern?: string) {
  await sql`
    INSERT INTO games (company_id, status, winning_pattern, target_winning_card_id, target_winning_ball_number, series, bonus_pattern, reintegro_pattern) 
    VALUES (${companyId}, 'active', ${pattern}, ${targetCardId || null}, ${targetBall || null}, ${series || ''}, ${bonusPattern || ''}, ${reintegroPattern || ''})
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

export async function drawSpecificBall(gameId: number, ballNumber: number) {
  // Check if ball already drawn
  const drawnBalls = await sql`SELECT number FROM balls WHERE game_id = ${gameId} AND number = ${ballNumber}`;
  if (drawnBalls.length > 0) return { error: 'Ball already drawn' };

  await sql`INSERT INTO balls (game_id, number) VALUES (${gameId}, ${ballNumber})`;
  revalidatePath('/admin');
  return { success: true, ball: ballNumber };
}

export async function undoLastBall(gameId: number) {
  // Get the most recent ball
  const lastBallQuery = await sql`SELECT id FROM balls WHERE game_id = ${gameId} ORDER BY drawn_at DESC LIMIT 1`;
  const lastBall = lastBallQuery[0];
  if (!lastBall) return { error: 'No balls to undo' };

  await sql`DELETE FROM balls WHERE id = ${lastBall.id}`;
  revalidatePath('/admin');
  return { success: true };
}

export async function loadCardsFromMaster(gameId: number, startRange: number, endRange: number) {
  // Instead of generating random cards, we import them from the master_cards table
  await sql`
    INSERT INTO cards (game_id, player_name, numbers_json)
    SELECT ${gameId}, 'Cartón ' || card_number, numbers_json
    FROM master_cards
    WHERE card_number >= ${startRange} AND card_number <= ${endRange}
  `;
  
  revalidatePath('/admin');
}

export async function endGame(gameId: number) {
  await sql`UPDATE games SET status = 'finished' WHERE id = ${gameId}`;
  revalidatePath('/admin');
}
