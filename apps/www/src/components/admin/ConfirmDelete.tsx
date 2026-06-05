export type ConfirmDeleteProps = {
  open: boolean;
  title?: string;
  message?: string;
  dependents?: Record<string, number>;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
};

// Pure, exported for unit testing. Renders dependent counts as human text, e.g.
// {beers: 3, events: 1} -> "used by 3 beers and 1 event". Zero counts are
// omitted. Returns '' when nothing depends on the entity.
export function formatDependents(dependents: Record<string, number>): string {
  const parts = Object.entries(dependents)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => {
      const singular = name.endsWith('s') ? name.slice(0, -1) : name;
      return `${count} ${count === 1 ? singular : name}`;
    });

  if (parts.length === 0) return '';

  const joined =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;

  return `used by ${joined}`;
}

export function ConfirmDelete({
  open,
  title = 'Delete this item?',
  message = 'This action cannot be undone.',
  dependents,
  onConfirm,
  onCancel,
  confirming = false,
}: ConfirmDeleteProps) {
  if (!open) return null;

  const blockedText =
    dependents && Object.values(dependents).some((count) => count > 0)
      ? formatDependents(dependents)
      : '';
  const blocked = blockedText !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg">
        <h2 className="font-display text-lg font-bold text-text">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">
          {blocked ? `Can't delete — ${blockedText}.` : message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-secondary hover:text-text"
          >
            {blocked ? 'Close' : 'Cancel'}
          </button>
          {blocked ? null : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              className="rounded-lg bg-red px-4 py-2 text-sm font-semibold text-check-fg disabled:opacity-60"
            >
              {confirming ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
