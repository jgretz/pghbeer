import {describe, it, expect} from 'bun:test';
import {signPayload, verifyPayload} from '../../src/lib/session-crypto';

const SECRET = 'test-session-secret-at-least-32-chars-long';

describe('session-crypto', function () {
  it('should verify a signature produced for the same payload and secret', async function () {
    const payload = JSON.stringify({email: 'admin@pghbeer.com', expires: 123});
    const sig = await signPayload(payload, SECRET);

    expect(await verifyPayload(payload, sig, SECRET)).toBe(true);
  });

  it('should reject a tampered payload', async function () {
    const payload = JSON.stringify({email: 'admin@pghbeer.com', expires: 123});
    const sig = await signPayload(payload, SECRET);
    const tampered = JSON.stringify({email: 'intruder@evil.com', expires: 123});

    expect(await verifyPayload(tampered, sig, SECRET)).toBe(false);
  });

  it('should reject a mutated signature', async function () {
    const payload = JSON.stringify({email: 'admin@pghbeer.com', expires: 123});
    const sig = await signPayload(payload, SECRET);
    const mutated = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1);

    expect(await verifyPayload(payload, mutated, SECRET)).toBe(false);
  });

  it('should reject a signature made with a different secret', async function () {
    const payload = JSON.stringify({email: 'admin@pghbeer.com', expires: 123});
    const sig = await signPayload(payload, SECRET);

    expect(await verifyPayload(payload, sig, 'a-completely-different-secret-value-here')).toBe(
      false,
    );
  });

  it('should return false for a malformed (non-base64) signature instead of throwing', async function () {
    expect(await verifyPayload('payload', '!!!not-base64!!!', SECRET)).toBe(false);
  });
});
