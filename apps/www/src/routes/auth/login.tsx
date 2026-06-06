import {createFileRoute} from '@tanstack/react-router';
import {createServerFn} from '@tanstack/react-start';

const getGoogleAuthUrl = createServerFn({method: 'GET'}).handler(async () => {
  const {buildGoogleAuthUrl} = await import('../../lib/auth.server');
  return buildGoogleAuthUrl();
});

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    error: search.error as string | undefined,
  }),
  head: () => ({
    meta: [{title: 'Sign in — PghBeer'}],
  }),
  loader: async () => {
    const authUrl = await getGoogleAuthUrl();
    return {authUrl};
  },
  component: LoginPage,
});

function LoginPage() {
  const {authUrl} = Route.useLoaderData();
  const {error} = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <div className="font-display text-2xl font-bold uppercase tracking-wide text-gold">
            PghBeer
          </div>
          <div className="text-[11px] text-text-secondary">Admin</div>
        </div>
        <p className="text-sm text-text-secondary">Sign in to manage the festival.</p>
        {error ? (
          <p className="rounded-lg bg-surface px-4 py-3 text-sm text-text">
            That account isn&apos;t authorized.
          </p>
        ) : null}
        <a
          href={authUrl}
          className="inline-block rounded-xl bg-gold px-6 py-3 font-semibold text-check-fg transition-colors"
        >
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
