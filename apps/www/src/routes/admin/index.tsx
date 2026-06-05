import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
  head: () => ({
    meta: [{title: 'PghBeer — Admin'}],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gold">Admin</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Pick an entity from the left rail to manage festival data.
      </p>
    </div>
  );
}
