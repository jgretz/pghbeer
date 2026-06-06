// Pure HMAC-SHA256 helpers — no env or cookie dependencies, so the signing
// core is unit-testable in isolation. The secret is passed in by the caller
// (session.server) rather than read here.

async function importKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    [usage],
  );
}

export async function signPayload(value: string, secret: string): Promise<string> {
  const key = await importKey(secret, 'sign');
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function verifyPayload(
  value: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const key = await importKey(secret, 'verify');
    const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(value));
  } catch {
    // Malformed base64 signature → treat as invalid, never throw.
    return false;
  }
}
