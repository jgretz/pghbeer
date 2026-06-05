import {parseEnv} from 'env';
import {z} from 'zod';

import type {GoogleAuthConfig} from './types.ts';

const schema = z
  .object({
    GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().min(1).optional(),
    GOOGLE_PRIVATE_KEY: z.string().min(1).optional(),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),
  })
  .refine(
    (env) =>
      Boolean(env.GOOGLE_APPLICATION_CREDENTIALS) ||
      Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY),
    {
      message:
        'provide either GOOGLE_APPLICATION_CREDENTIALS (key-file path) or both GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY',
    },
  );

/**
 * Build a normalized {@link GoogleAuthConfig} from the environment, surfacing a
 * clear `Invalid environment variables: ...` error (via `parseEnv`) when neither
 * credential shape is fully present. Inline keys are preferred; literal `\n` in
 * GOOGLE_PRIVATE_KEY is un-escaped to real newlines (Fly/env vars store PEM
 * single-line).
 */
export function loadGoogleAuthConfig(): GoogleAuthConfig {
  const env = parseEnv(schema);

  if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
    return {
      clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {keyFile: env.GOOGLE_APPLICATION_CREDENTIALS};
  }

  // Unreachable: the schema's .refine() guarantees one credential shape is present.
  throw new Error('Invalid environment variables: missing Google service-account credentials');
}
