import {useMemo, useState} from 'react';
import type {EventBrewery} from '../../../lib/admin/maps';

interface BreweryPickerSheetProps {
  slotLabel: string;
  breweries: EventBrewery[];
  // breweryId -> the slot label it is currently assigned to (if any)
  assignedLabels: Record<number, string>;
  currentBreweryId: number | null;
  onPick: (breweryId: number) => void;
  onClear: () => void;
  onClose: () => void;
}

// Day-of assignment: tap a table, search ~70 breweries, tap one. Unassigned
// breweries sort to the top; already-assigned ones are dimmed and tagged with
// their current slot.
export function BreweryPickerSheet({
  slotLabel,
  breweries,
  assignedLabels,
  currentBreweryId,
  onPick,
  onClose,
  onClear,
}: BreweryPickerSheetProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? breweries.filter((b) => b.name.toLowerCase().includes(q))
      : breweries;
    // Unassigned first, then by name (stable).
    return [...filtered].sort((a, b) => {
      const aAssigned = assignedLabels[a.id] != null ? 1 : 0;
      const bAssigned = assignedLabels[b.id] != null ? 1 : 0;
      if (aAssigned !== bAssigned) return aAssigned - bAssigned;
      return a.name.localeCompare(b.name);
    });
  }, [breweries, query, assignedLabels]);

  return (
    <div
      className="fixed inset-0 z-[199] flex items-end justify-center bg-overlay"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-[600px] flex-col rounded-t-[20px] bg-surface px-4 pb-8 pt-5 shadow-[0_-4px_20px_var(--color-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-[13px] font-semibold uppercase tracking-widest text-text-secondary">
            Assign to {slotLabel}
          </span>
          {currentBreweryId != null && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-border bg-surface px-3 py-1 text-xs font-medium text-red"
            >
              Clear
            </button>
          )}
        </div>

        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search breweries…"
          className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted"
        />

        <ul className="flex flex-col divide-y divide-border-light overflow-y-auto">
          {results.map((b) => {
            const at = assignedLabels[b.id];
            const isCurrent = b.id === currentBreweryId;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => onPick(b.id)}
                  className={`flex w-full items-center justify-between gap-3 px-1 py-3 text-left text-sm ${
                    at != null && !isCurrent ? 'text-text-muted' : 'text-text'
                  }`}
                >
                  <span className="truncate">
                    {b.name}
                    {isCurrent && <span className="text-gold"> · here</span>}
                  </span>
                  {at != null && !isCurrent && (
                    <span className="shrink-0 text-xs text-text-muted">at {at}</span>
                  )}
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="px-1 py-3 text-sm text-text-secondary">No matches.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
