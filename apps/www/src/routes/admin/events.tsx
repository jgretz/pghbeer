import {useCallback, useMemo, useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {
  DataTable,
  filterRows,
  type Column,
  type RowAction,
} from '../../components/admin/DataTable';
import {EntityForm, type FieldDef, type FieldValue} from '../../components/admin/EntityForm';
import {ConfirmDelete} from '../../components/admin/ConfirmDelete';
import {
  addBeerToEvent,
  createEvent,
  deleteEvent,
  listBeers,
  listBeersForEvent,
  listEvents,
  removeBeerFromEvent,
  updateEvent,
  type AdminBeer,
  type EventRow,
} from '../../lib/admin/events';

export const Route = createFileRoute('/admin/events')({
  head: () => ({
    meta: [{title: 'PghBeer — Events'}],
  }),
  component: AdminEvents,
});

const eventColumns: Column<EventRow>[] = [
  {id: 'name', header: 'Name', accessor: (row) => row.name},
  {id: 'date', header: 'Date', accessor: (row) => row.date},
];

// EntityForm has no native `date` field type; date is a free string matching
// the API's `min(1)` contract, entered as text (YYYY-MM-DD).
const eventFields: FieldDef[] = [
  {name: 'name', label: 'Name', type: 'text', required: true},
  {name: 'date', label: 'Date', type: 'text', required: true},
];

type FormMode = 'create' | {edit: EventRow} | null;

function AdminEvents() {
  const queryClient = useQueryClient();
  const events = useQuery({queryKey: ['admin', 'events'], queryFn: () => listEvents()});

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [dependents, setDependents] = useState<Record<string, number> | undefined>(undefined);
  const [managing, setManaging] = useState<EventRow | null>(null);

  const invalidateEvents = useCallback(
    () => queryClient.invalidateQueries({queryKey: ['admin', 'events']}),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (data: {name: string; date: string}) => createEvent({data}),
    onSuccess: () => {
      invalidateEvents();
      setFormMode(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {id: number; name: string; date: string}) => updateEvent({data}),
    onSuccess: () => {
      invalidateEvents();
      setFormMode(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEvent({data: {id}}),
    onSuccess: (result) => {
      if (result.ok) {
        invalidateEvents();
        setDeleteTarget(null);
        setDependents(undefined);
        return;
      }
      setDependents(result.dependents);
    },
  });

  const openCreate = useCallback(() => {
    setValues({name: '', date: ''});
    setFormMode('create');
  }, []);

  const openEdit = useCallback((row: EventRow) => {
    setValues({name: row.name, date: row.date});
    setFormMode({edit: row});
  }, []);

  const openManage = useCallback((row: EventRow) => setManaging(row), []);

  const openDelete = useCallback((row: EventRow) => {
    setDependents(undefined);
    setDeleteTarget(row);
  }, []);

  const handleFieldChange = useCallback((name: string, value: FieldValue) => {
    setValues((prev) => ({...prev, [name]: value}));
  }, []);

  const handleSubmit = useCallback(() => {
    const name = String(values.name ?? '');
    const date = String(values.date ?? '');
    if (formMode === 'create') {
      createMutation.mutate({name, date});
    } else if (formMode && 'edit' in formMode) {
      updateMutation.mutate({id: formMode.edit.id, name, date});
    }
  }, [values, formMode, createMutation, updateMutation]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);

  const actions = useCallback(
    (): RowAction<EventRow>[] => [
      {label: 'Edit', onClick: openEdit},
      {label: 'Manage beers', onClick: openManage},
      {label: 'Delete', onClick: openDelete, variant: 'danger'},
    ],
    [openEdit, openManage, openDelete],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold">Events</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg"
        >
          New event
        </button>
      </div>

      {events.isLoading ? (
        <p className="text-sm text-text-secondary">Loading events…</p>
      ) : events.isError ? (
        <p className="text-sm text-red">Failed to load events.</p>
      ) : (
        <DataTable
          columns={eventColumns}
          rows={events.data ?? []}
          getRowId={(row) => row.id}
          actions={actions}
          filterPlaceholder="Filter events…"
          emptyMessage="No events yet."
        />
      )}

      {formMode ? (
        <EntityForm
          fields={eventFields}
          values={values}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
          submitLabel={formMode === 'create' ? 'Create' : 'Save'}
        />
      ) : null}

      <ConfirmDelete
        open={deleteTarget !== null}
        title="Delete this event?"
        dependents={dependents}
        confirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDependents(undefined);
        }}
      />

      {managing ? (
        <BeerManager event={managing} onClose={() => setManaging(null)} />
      ) : null}
    </div>
  );
}

const linkedColumns: Column<AdminBeer>[] = [
  {id: 'name', header: 'Name', accessor: (row) => row.name},
  {id: 'brewery', header: 'Brewery', accessor: (row) => row.brewery.name},
  {id: 'style', header: 'Style', accessor: (row) => row.style.name},
];

type BeerManagerProps = {
  event: EventRow;
  onClose: () => void;
};

function BeerManager({event, onClose}: BeerManagerProps) {
  const queryClient = useQueryClient();
  const linkedKey = useMemo(() => ['admin', 'events', event.id, 'beers'], [event.id]);

  const linked = useQuery({
    queryKey: linkedKey,
    queryFn: () => listBeersForEvent({data: {eventId: event.id}}),
  });
  const allBeers = useQuery({queryKey: ['admin', 'beers'], queryFn: () => listBeers()});

  const [pickerQuery, setPickerQuery] = useState('');

  const invalidateLinked = useCallback(
    () => queryClient.invalidateQueries({queryKey: linkedKey}),
    [queryClient, linkedKey],
  );

  const addMutation = useMutation({
    mutationFn: (beerId: number) => addBeerToEvent({data: {eventId: event.id, beerId}}),
    onSuccess: invalidateLinked,
  });

  const removeMutation = useMutation({
    mutationFn: (beerId: number) =>
      removeBeerFromEvent({data: {eventId: event.id, beerId}}),
    onSuccess: invalidateLinked,
  });

  const linkedIds = useMemo(
    () => new Set((linked.data ?? []).map((beer) => beer.id)),
    [linked.data],
  );

  const pickerResults = useMemo(
    () => filterRows(allBeers.data ?? [], pickerColumns, pickerQuery).slice(0, 25),
    [allBeers.data, pickerQuery],
  );

  const handleRemove = useCallback(
    (row: AdminBeer) => removeMutation.mutate(row.id),
    [removeMutation],
  );

  const linkedActions = useCallback(
    (): RowAction<AdminBeer>[] => [
      {label: 'Remove', onClick: handleRemove, variant: 'danger'},
    ],
    [handleRemove],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text">
            Beers — {event.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary hover:text-text"
          >
            Close
          </button>
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-text-secondary">Linked beers</h3>
          {linked.isLoading ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : linked.isError ? (
            <p className="text-sm text-red">Failed to load linked beers.</p>
          ) : (
            <DataTable
              columns={linkedColumns}
              rows={linked.data ?? []}
              getRowId={(row) => row.id}
              actions={linkedActions}
              filterPlaceholder="Filter linked beers…"
              emptyMessage="No beers linked to this event yet."
            />
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-text-secondary">Add a beer</h3>
          <input
            type="text"
            value={pickerQuery}
            onChange={(e) => setPickerQuery(e.target.value)}
            placeholder="Search beers by name…"
            className="w-full max-w-xs rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted"
          />
          {allBeers.isLoading ? (
            <p className="text-sm text-text-secondary">Loading beers…</p>
          ) : allBeers.isError ? (
            <p className="text-sm text-red">Failed to load beers.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border-light rounded-lg border border-border">
              {pickerResults.map((beer) => {
                const isLinked = linkedIds.has(beer.id);
                return (
                  <li
                    key={beer.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="text-text">
                      {beer.name}
                      <span className="text-text-muted"> · {beer.brewery.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => addMutation.mutate(beer.id)}
                      disabled={isLinked}
                      className="rounded-md px-2 py-1 text-xs font-medium text-gold hover:underline disabled:text-text-muted disabled:no-underline"
                    >
                      {isLinked ? 'Added' : 'Add'}
                    </button>
                  </li>
                );
              })}
              {pickerResults.length === 0 ? (
                <li className="px-3 py-2 text-sm text-text-secondary">No matches.</li>
              ) : null}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

const pickerColumns: Column<AdminBeer>[] = [
  {id: 'name', header: 'Name', accessor: (row) => row.name},
];
