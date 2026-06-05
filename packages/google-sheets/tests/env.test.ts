import {afterEach, beforeEach, describe, expect, it} from 'bun:test';

import {loadGoogleAuthConfig} from '../src/env.ts';

const KEYS = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(function () {
  for (const key of KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(function () {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe('loadGoogleAuthConfig', function () {
  it('should throw a parseEnv error when no credentials are present', function () {
    expect(() => loadGoogleAuthConfig()).toThrow(/^Invalid environment variables:/);
  });

  it('should return inline credentials with un-escaped newlines', function () {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'svc@project.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN-----\\nline\\n-----END-----';

    const config = loadGoogleAuthConfig();

    expect(config).toEqual({
      clientEmail: 'svc@project.iam.gserviceaccount.com',
      privateKey: '-----BEGIN-----\nline\n-----END-----',
    });
  });

  it('should return the key-file path when only credentials path is present', function () {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/secrets/sa.json';

    expect(loadGoogleAuthConfig()).toEqual({keyFile: '/secrets/sa.json'});
  });
});
