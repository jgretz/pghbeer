import {GoogleAuth, JWT} from 'google-auth-library';

import {loadGoogleAuthConfig} from './env.ts';
import type {GoogleAuthConfig} from './types.ts';

export const SHEETS_READONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

/**
 * Mint a service-account access token scoped to read-only Sheets access.
 * Uses a signed JWT when inline key material is provided, otherwise a key-file
 * via {@link GoogleAuth}. Defaults its config to {@link loadGoogleAuthConfig}.
 */
export async function getAccessToken(
  config: GoogleAuthConfig = loadGoogleAuthConfig(),
): Promise<string> {
  const token =
    'keyFile' in config
      ? await getKeyFileToken(config.keyFile)
      : await getJwtToken(config.clientEmail, config.privateKey);

  if (!token) {
    throw new Error('Google auth returned no access token');
  }

  return token;
}

async function getJwtToken(email: string, key: string): Promise<string | null | undefined> {
  const jwt = new JWT({
    email,
    key,
    scopes: [SHEETS_READONLY_SCOPE],
  });

  try {
    const {token} = await jwt.getAccessToken();
    return token;
  } catch (error) {
    throw new Error('Failed to mint Google access token from JWT credentials', {
      cause: error,
    });
  }
}

async function getKeyFileToken(keyFile: string): Promise<string | null | undefined> {
  const auth = new GoogleAuth({keyFile, scopes: [SHEETS_READONLY_SCOPE]});

  try {
    const client = await auth.getClient();
    const {token} = await client.getAccessToken();
    return token;
  } catch (error) {
    throw new Error(`Failed to mint Google access token from key file: ${keyFile}`, {cause: error});
  }
}
