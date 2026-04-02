import {useState} from 'react';
import {HeadContent, Outlet, Scripts, createRootRoute} from '@tanstack/react-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {STORAGE_KEYS} from '../lib/constants';
import '../globals.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {charSet: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {name: 'theme-color', content: '#1a1a1a'},
    ],
    links: [
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

  const [persister] = useState(() =>
    typeof window !== 'undefined'
      ? createSyncStoragePersister({
          storage: window.localStorage,
          key: STORAGE_KEYS.queryCache,
        })
      : null,
  );

  // Inline script to set theme before React hydrates — prevents flash
  const themeInitScript = `
    (function() {
      var t = localStorage.getItem('${STORAGE_KEYS.theme}') || 'dark';
      document.documentElement.setAttribute('data-theme', t);
    })();
  `;

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-bg font-sans text-text">
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
        {persister ? (
          <PersistQueryClientProvider client={queryClient} persistOptions={{persister}}>
            <Outlet />
          </PersistQueryClientProvider>
        ) : (
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        )}
        <Scripts />
      </body>
    </html>
  );
}
