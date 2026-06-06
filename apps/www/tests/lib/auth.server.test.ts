import {describe, it, expect} from 'bun:test';
import {emailMatchesAllowlist} from '../../src/lib/auth.server';

describe('emailMatchesAllowlist', function () {
  it('should return true when the email exactly matches the allowlist', function () {
    expect(emailMatchesAllowlist('admin@pghbeer.com', 'admin@pghbeer.com')).toBe(true);
  });

  it('should return true when the email matches case-insensitively', function () {
    expect(emailMatchesAllowlist('Admin@PghBeer.com', 'admin@pghbeer.com')).toBe(true);
  });

  it('should return false when the email differs from the allowlist', function () {
    expect(emailMatchesAllowlist('intruder@evil.com', 'admin@pghbeer.com')).toBe(false);
  });

  it('should return true when surrounding whitespace differs', function () {
    expect(emailMatchesAllowlist('  admin@pghbeer.com  ', 'admin@pghbeer.com')).toBe(true);
  });
});
