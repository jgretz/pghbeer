import {NABadge} from './NABadge';
import type {Beer} from '../lib/types';

interface BeerRowProps {
  beer: Beer;
  breweryName: string;
  isTried: boolean;
  onToggle: () => void;
}

export function BeerRow({beer, isTried, onToggle}: BeerRowProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full min-h-[58px] items-center gap-3 border-b border-border-light px-4 py-3.5 text-left transition-colors ${
        isTried ? 'bg-tried-bg' : 'bg-surface'
      }`}
      aria-label={`${isTried ? 'Unmark' : 'Mark'} ${beer.name} as tried`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
          isTried ? 'border-gold bg-gold' : 'border-border bg-transparent'
        }`}
      >
        {isTried && <span className="text-[15px] font-bold text-check-fg">{'\u2713'}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-[15px] font-medium leading-tight ${
              isTried ? 'text-text-secondary' : 'text-text'
            }`}
          >
            {beer.name}
          </span>
          {beer.isNA && <NABadge label="NA" />}
        </div>
        <div
          className={`mt-0.5 flex items-center gap-2 text-xs ${
            isTried ? 'text-text-muted' : 'text-text-secondary'
          }`}
        >
          <span className="truncate">{beer.style.name}</span>
          {beer.abv != null && beer.abv > 0 && (
            <>
              <span className="text-border">{'\u00B7'}</span>
              <span className="shrink-0">{beer.abv}%</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
