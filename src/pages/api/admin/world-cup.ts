import type { APIRoute } from 'astro';

import { isAdminRequest } from '~/lib/admin-auth';
import { addWorldCupBet, deleteWorldCupBet, getWorldCupSegment } from '~/lib/world-cup-store';
import { bettors } from '~/utils/syndicate';

export const prerender = false;

function unauthorized() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  const segment = await getWorldCupSegment();
  return json(segment);
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  const body = (await request.json()) as {
    gameWeek?: number;
    bettor?: string;
    amountWon?: number;
  };

  const gameWeek = Number(body.gameWeek);
  const bettor = body.bettor?.trim().toLowerCase() ?? '';
  const amountWon = Number(body.amountWon);

  if (!Number.isInteger(gameWeek) || gameWeek < 1) {
    return json({ error: 'Round must be a positive whole number' }, 400);
  }

  if (!bettors.includes(bettor as (typeof bettors)[number])) {
    return json({ error: 'Bettor must be steven, luke, or jamie' }, 400);
  }

  if (!Number.isFinite(amountWon) || amountWon < 0) {
    return json({ error: 'Amount won must be zero or greater' }, 400);
  }

  const segment = await addWorldCupBet({
    gameWeek,
    bettor,
    amountWon,
  });

  return json(segment);
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const gameWeek = Number(url.searchParams.get('gameWeek'));

  if (!Number.isInteger(gameWeek) || gameWeek < 1) {
    return json({ error: 'Round must be a positive whole number' }, 400);
  }

  const segment = await deleteWorldCupBet(gameWeek);
  return json(segment);
};
