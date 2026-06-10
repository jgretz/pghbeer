import type {LayoutSwitchPreview} from '../../../lib/admin/maps';
import {ModalOverlay} from '../ModalOverlay';

type SwitchConfirmProps = {
  loading: boolean;
  preview: LayoutSwitchPreview | undefined;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Confirms making a layout the live public map, showing how many brewery
// assignments carry over (by matching slot label) and which would be dropped.
export function SwitchConfirm({
  loading,
  preview,
  confirming,
  onConfirm,
  onCancel,
}: SwitchConfirmProps) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg">
        <h2 className="font-display text-lg font-bold text-text">
          Make this the live map?
        </h2>
        {loading || !preview ? (
          <p className="mt-2 text-sm text-text-secondary">Checking assignments…</p>
        ) : (
          <div className="mt-2 text-sm text-text-secondary">
            <p>✓ {preview.carried} assignments carry over.</p>
            {preview.droppedBreweries.length > 0 && (
              <p className="mt-1 text-red">
                ⚠ {preview.droppedBreweries.length} brewery
                {preview.droppedBreweries.length === 1 ? '' : 's'} have no matching slot
                and will be unassigned:{' '}
                {preview.droppedBreweries.map((b) => b.name).join(', ')}.
              </p>
            )}
            <p className="mt-2">The public map switches immediately.</p>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-secondary hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming || loading}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg disabled:opacity-60"
          >
            {confirming ? 'Switching…' : 'Switch'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
