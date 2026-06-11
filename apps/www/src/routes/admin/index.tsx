import {useEffect, useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {listEvents} from '../../lib/admin/events';
import {fetchEventEnabled, setMapEnabled} from '../../lib/admin/maps';
import {bustCache} from '../../lib/admin/cache';
import {EVENT_ID} from '../../lib/constants';

export const Route = createFileRoute('/admin/')({
  head: () => ({
    meta: [{title: 'PghBeer — Admin'}],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const qc = useQueryClient();
  const eventsQ = useQuery({queryKey: ['admin', 'events'], queryFn: () => listEvents()});
  const [eventId, setEventId] = useState<number | null>(null);

  // Default to the live event (VITE_EVENT_ID), else the first one.
  useEffect(() => {
    if (eventId == null && eventsQ.data?.length) {
      const preferred = eventsQ.data.find((e) => String(e.id) === EVENT_ID);
      setEventId(preferred?.id ?? eventsQ.data[0].id);
    }
  }, [eventsQ.data, eventId]);

  const enabledQ = useQuery({
    queryKey: ['admin', 'map', 'enabled', eventId],
    queryFn: () => fetchEventEnabled({data: {eventId: eventId!}}),
    enabled: eventId != null,
  });

  const enabledMutation = useMutation({
    mutationFn: (enabled: boolean) => setMapEnabled({data: {eventId: eventId!, enabled}}),
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin', 'map', 'enabled', eventId]}),
  });

  const bustMutation = useMutation({
    mutationFn: () => bustCache({data: {eventId: eventId!}}),
  });

  const eventEnabled = enabledQ.data?.enabled ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gold">Admin</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Pick an entity from the left rail to manage festival data.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-text-secondary">
          Day-of controls
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => enabledMutation.mutate(!eventEnabled)}
            disabled={eventId == null || enabledMutation.isPending}
            className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
              eventEnabled
                ? 'bg-gold text-check-fg'
                : 'border border-border bg-surface text-text-secondary'
            }`}
          >
            {eventEnabled ? 'Map: Public' : 'Map: Hidden'}
          </button>

          <button
            type="button"
            onClick={() => bustMutation.mutate()}
            disabled={eventId == null || bustMutation.isPending}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text disabled:opacity-50"
          >
            {bustMutation.isPending ? 'Busting…' : 'Bust cache'}
          </button>

          {bustMutation.isSuccess && (
            <span className="text-sm text-text-secondary">
              Pushed — phones refetch on next page load.
            </span>
          )}
          {bustMutation.isError && (
            <span className="text-sm text-red">Bust failed — try again.</span>
          )}
        </div>
        <p className="text-xs text-text-muted">
          Bust cache stamps a new data version. Attendee phones compare it on page
          load and refetch the beer list + map when it changed.
        </p>
      </div>
    </div>
  );
}
