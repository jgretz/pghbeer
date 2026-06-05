import {createFileRoute, Link, Outlet} from '@tanstack/react-router';
import {NAV_ITEMS} from '../../components/admin/nav';

export const Route = createFileRoute('/admin')({
  // AUTH PLACEHOLDER — the auth task replaces this with a real session check;
  // do not add logic here now. Returning nothing allows everyone through.
  beforeLoad: () => {},
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-bg text-text">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <div className="font-display text-base font-bold uppercase tracking-wide text-gold">
            PghBeer
          </div>
          <div className="text-[11px] text-text-secondary">Admin</div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-alt hover:text-text"
              activeProps={{
                className:
                  'rounded-lg px-3 py-2 text-sm font-semibold bg-surface-alt text-gold',
              }}
              activeOptions={item.exact ? {exact: true} : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
