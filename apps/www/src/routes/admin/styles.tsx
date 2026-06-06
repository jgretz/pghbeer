import {useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {DataTable} from '../../components/admin/DataTable';
import {EntityForm} from '../../components/admin/EntityForm';
import {ConfirmDelete} from '../../components/admin/ConfirmDelete';
import {
  createStyle,
  deleteStyle,
  listStyles,
  updateStyle,
} from '../../lib/admin/styles';
import type {Style} from '../../lib/admin/styles';

export const Route = createFileRoute('/admin/styles')({
  head: () => ({
    meta: [{title: 'PghBeer — Styles'}],
  }),
  component: AdminStyles,
});

const STYLES_QUERY_KEY = ['admin', 'styles'] as const;

type FormState = {mode: 'create'} | {mode: 'edit'; style: Style} | null;

function AdminStyles() {
  const queryClient = useQueryClient();
  const stylesQuery = useQuery({
    queryKey: STYLES_QUERY_KEY,
    queryFn: () => listStyles(),
  });

  const [formState, setFormState] = useState<FormState>(null);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Style | null>(null);
  const [deleteDependents, setDeleteDependents] = useState<Record<
    string,
    number
  > | null>(null);

  function invalidate() {
    return queryClient.invalidateQueries({queryKey: STYLES_QUERY_KEY});
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (formState?.mode === 'edit') {
        return updateStyle({data: {id: formState.style.id, name}});
      }
      return createStyle({data: {name}});
    },
    onSuccess: async () => {
      await invalidate();
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (style: Style) => deleteStyle({data: {id: style.id}}),
    onSuccess: async (result) => {
      if (result.ok) {
        await invalidate();
        closeDelete();
        return;
      }
      setDeleteDependents(result.dependents);
    },
  });

  function openCreate() {
    setFormState({mode: 'create'});
    setName('');
  }

  function openEdit(style: Style) {
    setFormState({mode: 'edit', style});
    setName(style.name);
  }

  function closeForm() {
    setFormState(null);
    setName('');
  }

  function openDelete(style: Style) {
    setDeleteTarget(style);
    setDeleteDependents(null);
  }

  function closeDelete() {
    setDeleteTarget(null);
    setDeleteDependents(null);
  }

  const styles = stylesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold">Styles</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg"
        >
          New Style
        </button>
      </div>

      {stylesQuery.isPending ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : stylesQuery.isError ? (
        <p className="text-sm text-red">Failed to load styles.</p>
      ) : (
        <DataTable
          columns={[{id: 'name', header: 'Name', accessor: (row) => row.name}]}
          rows={styles}
          getRowId={(row) => row.id}
          filterPlaceholder="Filter styles…"
          actions={(row) => [
            {label: 'Edit', onClick: () => openEdit(row)},
            {label: 'Delete', onClick: () => openDelete(row), variant: 'danger'},
          ]}
        />
      )}

      {formState ? (
        <EntityForm
          as="modal"
          fields={[{name: 'name', label: 'Name', type: 'text', required: true}]}
          values={{name}}
          onChange={(_, value) =>
            setName(typeof value === 'string' ? value : '')
          }
          onSubmit={() => saveMutation.mutate()}
          onCancel={closeForm}
          submitLabel={saveMutation.isPending ? 'Saving…' : 'Save'}
        />
      ) : null}

      <ConfirmDelete
        open={deleteTarget !== null}
        title="Delete this style?"
        dependents={deleteDependents ?? undefined}
        confirming={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onCancel={closeDelete}
      />
    </div>
  );
}
