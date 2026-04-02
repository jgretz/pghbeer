interface FilterToggleProps {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
  variant: 'na' | 'tried';
}

export function FilterToggle({label, icon, active, onClick, variant}: FilterToggleProps) {
  const activeClasses =
    variant === 'na'
      ? 'border-na-green bg-na-green-bg text-na-green'
      : 'border-gold-dark bg-gold-light text-gold-dark dark:text-gold';

  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-[18px] py-2.5 text-sm font-semibold transition-all ${
        active
          ? `border-2 ${activeClasses}`
          : 'border-[1.5px] border-border bg-surface text-text-secondary'
      }`}
    >
      {icon && <span className="text-[13px]">{icon}</span>}{label}
    </button>
  );
}
