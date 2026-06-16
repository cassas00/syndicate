import type { APIRoute } from 'astro';

import { getWorldCupSegment } from '~/lib/world-cup-store';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const segment = await getWorldCupSegment();
    return new Response(JSON.stringify(segment), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to load world cup segment', error);
    return new Response(JSON.stringify({ error: 'Failed to load world cup data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
