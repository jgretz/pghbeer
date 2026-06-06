// SERVER-ONLY module. HMAC-SHA256-signed session cookie. Must never be
// imported into client code — pull it in via dynamic import inside
// createServerFn handlers only.
import {getCookie, setCookie} from '@tanstack/react-start/server';
import {getEnv} from './env.server';
import {signPayload, verifyPayload} from './session-crypto';

const SESSION_COOKIE = 'pghbeer_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type SessionData = {
  email: string;
  authenticated: boolean;
};

type SessionPayload = {
  data: SessionData;
  expires: number;
  sig: string;
};

export async function createSession(email: string): Promise<void> {
  const data: SessionData = {email, authenticated: true};
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = JSON.stringify({data, expires});
  const sig = await signPayload(payload, getEnv().SESSION_SECRET);
  const cookie: SessionPayload = {data, expires, sig};

  setCookie(SESSION_COOKIE, btoa(JSON.stringify(cookie)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionData | null> {
  const raw = getCookie(SESSION_COOKIE);
  if (!raw) return null;

  try {
    const cookie: SessionPayload = JSON.parse(atob(raw));
    if (Date.now() > cookie.expires) return null;

    const payload = JSON.stringify({data: cookie.data, expires: cookie.expires});
    const valid = await verifyPayload(payload, cookie.sig, getEnv().SESSION_SECRET);
    if (!valid) return null;

    return cookie.data;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  setCookie(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
