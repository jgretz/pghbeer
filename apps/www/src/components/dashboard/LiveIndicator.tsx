import {useState, useEffect} from 'react';

interface Props {
  generatedAt: string;
  isError: boolean;
}

function formatAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export function LiveIndicator({generatedAt, isError}: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const stale = isError || Date.now() - new Date(generatedAt).getTime() > 90_000;

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-alt px-2.5 py-1">
      <div
        className="h-[7px] w-[7px] rounded-full"
        style={{
          background: stale ? '#E67E22' : '#4B916D',
          animation: stale ? 'none' : 'pulse 2s infinite',
        }}
      />
      <span className="text-[11px] text-text-secondary">
        {stale ? 'Stale · ' : ''}
        {formatAgo(generatedAt)}
      </span>
    </div>
  );
}
