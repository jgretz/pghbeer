// SERVER-ONLY module. Reads and validates Google OAuth + session env vars.
// Must never be imported into client code — pull it in via dynamic import
// inside createServerFn handlers only.
import {parseEnv} from 'env';
import {z} from 'zod';

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),
  ALLOWED_EMAIL: z.string().email(),
  SESSION_SECRET: z.string().min(32),
});

let cached: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!cached) {
    cached = parseEnv(envSchema);
  }
  return cached;
}
