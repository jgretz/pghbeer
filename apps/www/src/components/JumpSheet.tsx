import type {BreweryGroup} from '../lib/types';

interface JumpSheetProps {
  breweries: BreweryGroup[];
  onSelect: (letter: string) => void;
  onClose: () => void;
}

function getAvailableLetters(breweries: BreweryGroup[]): string[] {
  const letters = new Set<string>();
  for (const b of breweries) {
    letters.add(b.name[0].toUpperCase());
  }
  return Array.from(letters).sort();
}

export function JumpSheet({breweries, onSelect, onClose}: JumpSheetProps) {
  const letters = getAvailableLetters(breweries);

  return (
    <div
      className="fixed inset-0 z-[199] flex items-end justify-center bg-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-[20px] bg-surface px-4 pb-9 pt-5 shadow-[0_-4px_20px_var(--color-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
        <div className="mb-3.5 text-center font-display text-[13px] font-semibold uppercase tracking-widest text-text-secondary">
          Jump to Brewery
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => onSelect(letter)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] border-border bg-bg font-display text-lg font-semibold text-text"
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
