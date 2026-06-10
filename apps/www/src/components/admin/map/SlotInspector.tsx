import {useId} from 'react';

import type {DraftSlot} from '../../../lib/admin/mapDraft';
import type {AlignKind} from '../../../lib/admin/mapAlign';

interface SlotInspectorProps {
  slots: DraftSlot[]; // one or more selected
  onField: (field: 'x' | 'y' | 'width' | 'height', value: number) => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAlign: (kind: AlignKind) => void;
}

const STEP = 10;

// Shared value across all selected, or null when they differ ("Many").
function common<T>(slots: DraftSlot[], pick: (s: DraftSlot) => T): T | null {
  if (slots.length === 0) return null;
  const first = pick(slots[0]);
  return slots.every((s) => pick(s) === first) ? first : null;
}

export function SlotInspector({
  slots,
  onField,
  onToggleLock,
  onDuplicate,
  onDelete,
  onAlign,
}: SlotInspectorProps) {
  const multi = slots.length > 1;
  const allLocked = slots.every((s) => s.locked);
  const kind = common(slots, (s) => s.kind);

  const title = multi
    ? `${slots.length} selected`
    : kind === 'zone'
      ? 'Zone'
      : 'Table';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleLock}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text"
          >
            {allLocked ? '🔒 Unlock' : '🔓 Lock'}
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-red px-3 py-1.5 text-xs font-semibold text-check-fg"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stepper label="X" value={common(slots, (s) => s.x)} onChange={(v) => onField('x', v)} />
        <Stepper label="Y" value={common(slots, (s) => s.y)} onChange={(v) => onField('y', v)} />
        <Stepper
          label="Width"
          value={common(slots, (s) => s.width)}
          min={20}
          onChange={(v) => onField('width', v)}
        />
        <Stepper
          label="Height"
          value={common(slots, (s) => s.height)}
          min={20}
          onChange={(v) => onField('height', v)}
        />
      </div>

      {multi && (
        <div className="flex flex-col gap-2 border-t border-border-light pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Align
          </span>
          <div className="flex flex-wrap gap-1.5">
            <AlignButton onClick={() => onAlign('left')} title="Align left">
              ⊣
            </AlignButton>
            <AlignButton onClick={() => onAlign('hcenter')} title="Center horizontally">
              ↔
            </AlignButton>
            <AlignButton onClick={() => onAlign('right')} title="Align right">
              ⊢
            </AlignButton>
            <AlignButton onClick={() => onAlign('top')} title="Align top">
              ⊤
            </AlignButton>
            <AlignButton onClick={() => onAlign('vcenter')} title="Center vertically">
              ↕
            </AlignButton>
            <AlignButton onClick={() => onAlign('bottom')} title="Align bottom">
              ⊥
            </AlignButton>
            {slots.length >= 3 && (
              <>
                <AlignButton onClick={() => onAlign('distribute-h')} title="Distribute horizontally">
                  ⇿
                </AlignButton>
                <AlignButton onClick={() => onAlign('distribute-v')} title="Distribute vertically">
                  ⇳
                </AlignButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AlignButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-base text-text"
    >
      {children}
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number | null; // null => mixed ("Many")
  min?: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const clamp = (v: number) => (min != null ? Math.max(min, v) : v);
  const mixed = value === null;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-text-secondary">
        {label}
      </label>
      <div className="flex items-stretch">
        <button
          type="button"
          disabled={mixed}
          onClick={() => value !== null && onChange(clamp(Math.round(value) - STEP))}
          className="flex w-9 items-center justify-center rounded-l-lg border border-r-0 border-border bg-surface-alt text-lg text-text disabled:opacity-40"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          value={mixed ? '' : Math.round(value)}
          placeholder={mixed ? 'Many' : undefined}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          className="w-full border-y border-border bg-surface px-2 py-2 text-center text-sm text-text placeholder:text-text-muted"
        />
        <button
          type="button"
          disabled={mixed}
          onClick={() => value !== null && onChange(clamp(Math.round(value) + STEP))}
          className="flex w-9 items-center justify-center rounded-r-lg border border-l-0 border-border bg-surface-alt text-lg text-text disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
