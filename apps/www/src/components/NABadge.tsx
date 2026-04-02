interface NABadgeProps {
  label: string;
  size?: 'sm' | 'md';
}

export function NABadge({label, size = 'sm'}: NABadgeProps) {
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-[3px]';

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border border-na-green-light/25 bg-na-green-bg font-bold uppercase text-na-green ${textSize} ${padding} shrink-0`}
    >
      <span className={textSize}>{'\u{1F33F}'}</span> {label}
    </span>
  );
}
