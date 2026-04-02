import {NABadge} from './NABadge';
import type {Beer} from '../lib/types';

interface BreweryHeaderProps {
  name: string;
  beers: Beer[];
  filtersVisible: boolean;
}

export function BreweryHeader({name, beers, filtersVisible}: BreweryHeaderProps) {
  const allNA = beers.every((b) => b.isNA);
  const someNA = !allNA && beers.some((b) => b.isNA);

  return (
    <div
      className="sticky z-10 flex items-center gap-2 border-b border-t border-border-light bg-surface-alt px-4 py-2.5 transition-all"
      style={{top: filtersVisible ? 86 : 120}}
    >
      <div className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold uppercase tracking-wide text-text dark:text-gold">
        {name}
      </div>
      {allNA && <NABadge label="NA Vendor" size="md" />}
      {someNA && <NABadge label="+NA" size="md" />}
      <span className="shrink-0 text-xs font-medium text-text-muted">{beers.length}</span>
    </div>
  );
}
