interface ProgressBarProps {
  tried: number;
  total: number;
}

export function ProgressBar({tried, total}: ProgressBarProps) {
  const pct = total > 0 ? (tried / total) * 100 : 0;

  return (
    <div className="relative px-4 pb-2.5">
      <div className="relative h-[22px] overflow-hidden rounded-full bg-progress-track">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-[width] duration-400 ease-out"
          style={{width: `${pct}%`}}
        />
        <span
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 font-display text-xs font-bold tracking-wide ${
            pct > 85 ? 'text-check-fg' : 'text-text'
          }`}
        >
          {tried} / {total}
        </span>
      </div>
    </div>
  );
}
