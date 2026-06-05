import {z} from 'zod';

export function parseEnv<T>(schema: z.ZodType<T>): T {
  const env = process.env;
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }

  return result.data;
}
