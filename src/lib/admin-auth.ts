import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'syndicate_admin';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getAdminCredentials() {
  return {
    username: process.env.SYNDICATE_ADMIN_USER ?? 'admin',
    password: process.env.SYNDICATE_ADMIN_PASSWORD ?? 'trio',
  };
}

function getSessionSecret(): string {
  return process.env.SYNDICATE_SESSION_SECRET ?? 'syndicate-local-dev-secret';
}

function signPayload(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `admin:${expiresAt}`;
  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return false;
  }

  const expected = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  const [, expiresAtRaw] = payload.split(':');
  const expiresAt = Number(expiresAtRaw);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  return username === credentials.username && password === credentials.password;
}

export function getSessionCookieHeader(token: string): string {
  const maxAge = Math.floor(SESSION_MAX_AGE_MS / 1000);
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

export function getClearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function getSessionTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(';')) {
    const [name, ...valueParts] = part.trim().split('=');
    if (name === COOKIE_NAME) {
      return valueParts.join('=');
    }
  }

  return undefined;
}

export function isAdminRequest(request: Request): boolean {
  return verifySessionToken(getSessionTokenFromRequest(request));
}
