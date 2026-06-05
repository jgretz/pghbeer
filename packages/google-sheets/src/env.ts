import {parseEnv} from 'env';
import {z} from 'zod';

import type {GoogleAuthConfig} from './types.ts';

const baseSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().min(1).optional(),
  GOOGLE_PRIVATE_KEY: z.string().min(1).optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),
});

type GoogleAuthEnv = z.infer<typeof baseSchema>;

const schema = baseSchema.refine(
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
  // parseEnv is typed for ZodObject; the cross-field .refine() yields a
  // ZodEffects whose runtime safeParse still validates. Cast at this single
  // boundary, then restore the inferred shape.
  const env = parseEnv(schema as unknown as z.ZodObject<z.ZodRawShape>) as GoogleAuthEnv;

  if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
    return {
      clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return {keyFile: env.GOOGLE_APPLICATION_CREDENTIALS as string};
}
