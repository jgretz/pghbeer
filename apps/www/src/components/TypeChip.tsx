interface TypeChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function TypeChip({label, active, onClick}: TypeChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-[18px] py-2.5 text-sm font-semibold transition-all ${
        active
          ? 'border-2 border-gold bg-gold text-check-fg'
          : 'border-[1.5px] border-border bg-surface text-text-secondary'
      }`}
    >
      {label}
    </button>
  );
}
