import type { APIRoute } from 'astro';

import {
  createSessionToken,
  getClearSessionCookieHeader,
  getSessionCookieHeader,
  isAdminRequest,
  verifyAdminCredentials,
} from '~/lib/admin-auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({ authenticated: isAdminRequest(request) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username?.trim() ?? '';
  const password = body.password ?? '';

  if (!verifyAdminCredentials(username, password)) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = createSessionToken();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': getSessionCookieHeader(token),
    },
  });
};

export const DELETE: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': getClearSessionCookieHeader(),
    },
  });
};
