import {createServerFn} from '@tanstack/react-start';

// Dynamic-imports session.server so the server-only module is never pulled
// into the client bundle.
export const getAuthState = createServerFn({method: 'GET'}).handler(async () => {
  const {getSession} = await import('./session.server');
  const session = await getSession();
  if (!session?.authenticated) {
    return {authenticated: false as const};
  }
  return {authenticated: true as const, email: session.email};
});
