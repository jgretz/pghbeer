import {useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {BeerListItem} from '@domain';

import {DataTable} from '../../components/admin/DataTable';
import type {Column, RowAction} from '../../components/admin/DataTable';
import {EntityForm} from '../../components/admin/EntityForm';
import type {FieldDef, FieldValue} from '../../components/admin/EntityForm';
import {ConfirmDelete} from '../../components/admin/ConfirmDelete';
import {
  BEVERAGE_TYPES,
  createBeer,
  deleteBeer,
  listBeers,
  listBreweries,
  listStyles,
  toBeerPayload,
  updateBeer,
} from '../../lib/admin/beers';

export const Route = createFileRoute('/admin/beers')({
  head: () => ({
    meta: [{title: 'PghBeer — Beers'}],
  }),
  component: BeersAdmin,
});

const BEERS_KEY = ['admin', 'beers'] as const;

const columns: Column<BeerListItem>[] = [
  {id: 'name', header: 'Name', accessor: (row) => row.name},
  {id: 'brewery', header: 'Brewery', accessor: (row) => row.brewery.name},
  {id: 'style', header: 'Style', accessor: (row) => row.style.name},
  {id: 'abv', header: 'ABV', accessor: (row) => row.abv},
  {id: 'type', header: 'Type', accessor: (row) => row.beverageType},
  {
    id: 'na',
    header: 'NA',
    accessor: (row) => row.isNa,
    cell: (row) => (row.isNa ? '✓' : ''),
  },
];

function emptyValues(): Record<string, FieldValue> {
  return {
    name: '',
    abv: null,
    beverageType: '',
    isNa: false,
    breweryId: '',
    styleId: '',
  };
}

function valuesFromBeer(beer: BeerListItem): Record<string, FieldValue> {
  return {
    name: beer.name,
    abv: beer.abv,
    beverageType: beer.beverageType,
    isNa: beer.isNa,
    breweryId: String(beer.brewery.id),
    styleId: String(beer.style.id),
  };
}

function BeersAdmin() {
  const queryClient = useQueryClient();

  const beersQuery = useQuery({queryKey: BEERS_KEY, queryFn: () => listBeers()});
  const breweriesQuery = useQuery({
    queryKey: ['admin', 'breweries'],
    queryFn: () => listBreweries(),
  });
  const stylesQuery = useQuery({
    queryKey: ['admin', 'styles'],
    queryFn: () => listStyles(),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BeerListItem | null>(null);
  const [values, setValues] = useState<Record<string, FieldValue>>(emptyValues);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<BeerListItem | null>(null);
  const [blockedDependents, setBlockedDependents] = useState<
    Record<string, number> | undefined
  >(undefined);

  function invalidateBeers() {
    return queryClient.invalidateQueries({queryKey: BEERS_KEY});
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = toBeerPayload(values);
      if (!payload) throw new Error('Name, type, brewery, and style are required.');
      return editing
        ? updateBeer({data: {id: editing.id, data: payload}})
        : createBeer({data: payload});
    },
    onSuccess: async () => {
      await invalidateBeers();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBeer({data: id}),
    onSuccess: async (result) => {
      if (result.ok) {
        await invalidateBeers();
        setDeleting(null);
        setBlockedDependents(undefined);
        return;
      }
      setBlockedDependents(result.dependents);
    },
  });

  function openCreate() {
    setEditing(null);
    setValues(emptyValues());
    setFormError(null);
    saveMutation.reset();
    setFormOpen(true);
  }

  function openEdit(beer: BeerListItem) {
    setEditing(beer);
    setValues(valuesFromBeer(beer));
    setFormError(null);
    saveMutation.reset();
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
  }

  function openDelete(beer: BeerListItem) {
    setDeleting(beer);
    setBlockedDependents(undefined);
    deleteMutation.reset();
  }

  function closeDelete() {
    setDeleting(null);
    setBlockedDependents(undefined);
  }

  function handleSubmit() {
    if (!toBeerPayload(values)) {
      setFormError('Name, type, brewery, and style are required.');
      return;
    }
    setFormError(null);
    saveMutation.mutate();
  }

  const fields: FieldDef[] = [
    {type: 'text', name: 'name', label: 'Name', required: true},
    {type: 'number', name: 'abv', label: 'ABV'},
    {
      type: 'select',
      name: 'beverageType',
      label: 'Type',
      required: true,
      options: BEVERAGE_TYPES.map((value) => ({value, label: value})),
    },
    {type: 'checkbox', name: 'isNa', label: 'Non-alcoholic'},
    {
      type: 'select',
      name: 'breweryId',
      label: 'Brewery',
      required: true,
      options: (breweriesQuery.data ?? []).map((b) => ({
        value: b.id,
        label: b.name,
      })),
    },
    {
      type: 'select',
      name: 'styleId',
      label: 'Style',
      required: true,
      options: (stylesQuery.data ?? []).map((s) => ({
        value: s.id,
        label: s.name,
      })),
    },
  ];

  const rowActions = (): RowAction<BeerListItem>[] => [
    {label: 'Edit', onClick: openEdit},
    {label: 'Delete', onClick: openDelete, variant: 'danger'},
  ];

  const isLoading =
    beersQuery.isLoading || breweriesQuery.isLoading || stylesQuery.isLoading;
  const loadError =
    beersQuery.error ?? breweriesQuery.error ?? stylesQuery.error;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold">Beers</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg"
        >
          Add beer
        </button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red bg-surface px-4 py-3 text-sm text-red">
          {loadError instanceof Error ? loadError.message : 'Failed to load beers.'}
        </div>
      ) : isLoading ? (
        <div className="text-sm text-text-secondary">Loading…</div>
      ) : (
        <DataTable
          columns={columns}
          rows={beersQuery.data ?? []}
          getRowId={(row) => row.id}
          actions={rowActions}
          filterPlaceholder="Filter by name, brewery, or style…"
          emptyMessage="No beers yet."
        />
      )}

      {formOpen ? (
        <div className="flex flex-col gap-2">
          <EntityForm
            fields={fields}
            values={values}
            onChange={(name, value) =>
              setValues((prev) => ({...prev, [name]: value}))
            }
            onSubmit={handleSubmit}
            onCancel={closeForm}
            submitLabel={editing ? 'Save changes' : 'Create beer'}
          />
          {formError || saveMutation.error ? (
            <p className="text-sm text-red">
              {formError ??
                (saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : 'Save failed.')}
            </p>
          ) : null}
        </div>
      ) : null}

      <ConfirmDelete
        open={deleting !== null}
        title="Delete this beer?"
        dependents={blockedDependents}
        confirming={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={closeDelete}
      />
    </div>
  );
}
