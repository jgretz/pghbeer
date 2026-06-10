import type {AdminMapLayoutSummary} from '../../../lib/admin/maps';

interface LayoutSwitcherProps {
  layouts: AdminMapLayoutSummary[];
  selectedLayoutId: number | null;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDuplicate: (id: number) => void;
  onSetActive: (id: number) => void;
  onDelete: (id: number) => void;
}

// Editing a layout (Select) is free; publishing one (Set active) is the gated
// action — it's what the public map reads.
export function LayoutSwitcher({
  layouts,
  selectedLayoutId,
  onSelect,
  onCreate,
  onDuplicate,
  onSetActive,
  onDelete,
}: LayoutSwitcherProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Layouts
        </span>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-check-fg"
        >
          New layout
        </button>
      </div>

      {layouts.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No layouts yet — create one to start building the map.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-light">
          {layouts.map((l) => {
            const selected = l.id === selectedLayoutId;
            return (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-2 py-2"
              >
                <button
                  type="button"
                  onClick={() => onSelect(l.id)}
                  className={`flex-1 truncate text-left text-sm font-medium ${
                    selected ? 'text-gold' : 'text-text'
                  }`}
                >
                  {l.name}
                </button>
                {l.isActive && (
                  <span className="rounded-full bg-gold-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-dark">
                    Live
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onDuplicate(l.id)}
                  className="rounded-md border border-border px-2 py-1 text-xs text-text-secondary"
                >
                  Duplicate
                </button>
                {!l.isActive && (
                  <button
                    type="button"
                    onClick={() => onSetActive(l.id)}
                    className="rounded-md border border-gold px-2 py-1 text-xs font-medium text-gold"
                  >
                    Set active
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(l.id)}
                  className="rounded-md px-2 py-1 text-xs text-red"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
