import {useState, useEffect} from 'react';
import {HeadContent, Outlet, Scripts, createRootRoute} from '@tanstack/react-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import type {Persister} from '@tanstack/react-query-persist-client';
import {STORAGE_KEYS} from '../lib/constants';
import '../globals.css';

function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center bg-bg px-4 text-center">
      <div className="font-display text-[72px] font-bold leading-none text-gold">404</div>
      <div className="mt-2 font-display text-lg font-semibold text-text">
        Nothing on tap here.
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        This page must have been someone&apos;s last pour.
      </p>
      <a
        href="/"
        className="mt-6 rounded-xl bg-gold px-6 py-2.5 font-semibold text-check-fg transition-colors"
      >
        Back to the list
      </a>
    </div>
  );
}

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      {charSet: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {name: 'theme-color', content: '#1a1a1a'},
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon-32.png',
      },
      {
        rel: 'apple-touch-icon',
        href: '/favicon-180.png',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: Infinity,
            staleTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  // Create persister after mount to avoid hydration mismatch
  const [persister, setPersister] = useState<Persister | null>(null);
  useEffect(() => {
    setPersister(
      createSyncStoragePersister({
        storage: window.localStorage,
        key: STORAGE_KEYS.queryCache,
      }),
    );
  }, []);

  // Inline script to set theme before React hydrates — prevents flash
  const themeInitScript = `
    (function() {
      var t = localStorage.getItem('${STORAGE_KEYS.theme}') || 'dark';
      document.documentElement.setAttribute('data-theme', t);
    })();
  `;

  const content = <Outlet />;

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-bg font-sans text-text">
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
        {persister ? (
          <PersistQueryClientProvider client={queryClient} persistOptions={{persister}}>
            {content}
          </PersistQueryClientProvider>
        ) : (
          <QueryClientProvider client={queryClient}>
            {content}
          </QueryClientProvider>
        )}
        <Scripts />
      </body>
    </html>
  );
}
