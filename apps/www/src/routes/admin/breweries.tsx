import {useCallback, useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {DataTable} from '../../components/admin/DataTable';
import type {Column, RowAction} from '../../components/admin/DataTable';
import {EntityForm} from '../../components/admin/EntityForm';
import type {FieldDef} from '../../components/admin/EntityForm';
import {ConfirmDelete} from '../../components/admin/ConfirmDelete';
import {
  createBrewery,
  deleteBrewery,
  listBreweries,
  updateBrewery,
} from '../../lib/admin/breweries';
import type {Brewery} from '../../lib/admin/breweries';

export const Route = createFileRoute('/admin/breweries')({
  head: () => ({
    meta: [{title: 'PghBeer — Breweries'}],
  }),
  component: BreweriesPage,
});

const QUERY_KEY = ['admin', 'breweries'] as const;

const COLUMNS: Column<Brewery>[] = [{id: 'name', header: 'Name', accessor: (row) => row.name}];

const FIELDS: FieldDef[] = [{name: 'name', label: 'Name', type: 'text', required: true}];

// 'new' = the create form; a Brewery = editing that row; null = no form open.
type Editing = Brewery | 'new' | null;

function BreweriesPage() {
  const queryClient = useQueryClient();

  const {data: breweries = [], isLoading} = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listBreweries(),
  });

  const [editing, setEditing] = useState<Editing>(null);
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState<Brewery | null>(null);
  const [deleteDependents, setDeleteDependents] = useState<Record<string, number> | undefined>(
    undefined,
  );

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({queryKey: QUERY_KEY}),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (next: string) => createBrewery({data: {name: next}}),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: {id: number; name: string}) => updateBrewery({data: vars}),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBrewery({data: {id}}),
    onSuccess: (result) => {
      if (result.ok) {
        invalidate();
        closeDelete();
      } else {
        setDeleteDependents(result.dependents);
      }
    },
  });

  function closeForm() {
    setEditing(null);
    setName('');
  }

  function closeDelete() {
    setDeleting(null);
    setDeleteDependents(undefined);
  }

  const openCreate = useCallback(() => {
    setEditing('new');
    setName('');
  }, []);

  const openEdit = useCallback((row: Brewery) => {
    setEditing(row);
    setName(row.name);
  }, []);

  const openDelete = useCallback((row: Brewery) => {
    setDeleting(row);
    setDeleteDependents(undefined);
  }, []);

  const actions = useCallback(
    (): RowAction<Brewery>[] => [
      {label: 'Edit', onClick: openEdit},
      {label: 'Delete', variant: 'danger', onClick: openDelete},
    ],
    [openEdit, openDelete],
  );

  function handleSubmit() {
    const trimmed = name.trim();
    if (trimmed === '') return;

    if (editing === 'new') {
      createMutation.mutate(trimmed);
    } else if (editing) {
      updateMutation.mutate({id: editing.id, name: trimmed});
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold">Breweries</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg"
        >
          New brewery
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={breweries}
          getRowId={(row) => row.id}
          actions={actions}
          filterPlaceholder="Filter breweries…"
          emptyMessage="No breweries yet."
        />
      )}

      {editing ? (
        <EntityForm
          fields={FIELDS}
          values={{name}}
          onChange={(_, value) => setName(typeof value === 'string' ? value : '')}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitLabel={editing === 'new' ? 'Create' : 'Save'}
        />
      ) : null}

      <ConfirmDelete
        open={deleting !== null}
        title="Delete brewery?"
        message={deleting ? `Delete "${deleting.name}"? This action cannot be undone.` : undefined}
        dependents={deleteDependents}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={closeDelete}
        confirming={deleteMutation.isPending}
      />
    </div>
  );
}
