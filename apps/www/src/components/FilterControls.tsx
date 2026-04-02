import {SearchInput} from './SearchInput';
import {TypeChip} from './TypeChip';
import {FilterToggle} from './FilterToggle';
import type {BeverageType} from '../lib/types';
import {BEVERAGE_ICONS, BEVERAGE_LABELS} from '../lib/constants';

interface FilterControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  activeTypes: Set<BeverageType>;
  availableTypes: BeverageType[];
  onToggleType: (type: BeverageType) => void;
  onClearTypes: () => void;
  naOnly: boolean;
  onToggleNA: () => void;
  showTriedOnly: boolean;
  onToggleTried: () => void;
}

export function FilterControls({
  search,
  onSearchChange,
  onSearchClear,
  activeTypes,
  availableTypes,
  onToggleType,
  onClearTypes,
  naOnly,
  onToggleNA,
  showTriedOnly,
  onToggleTried,
}: FilterControlsProps) {
  const isAllSelected = activeTypes.size === 0;

  return (
    <div className="border-b border-border bg-surface px-4 pb-3.5 pt-4 transition-colors">
      <div className="mb-3.5 text-xs text-text-secondary">
        June 13, 2026 {'\u00B7'} Carrie Blast Furnaces
      </div>

      <SearchInput value={search} onChange={onSearchChange} onClear={onSearchClear} />

      <div className="mb-3 flex flex-wrap gap-2">
        <TypeChip label="All" active={isAllSelected} onClick={onClearTypes} />
        {availableTypes.map((type) => (
          <TypeChip
            key={type}
            label={BEVERAGE_LABELS[type] ?? type}
            icon={BEVERAGE_ICONS[type]}
            active={activeTypes.has(type)}
            onClick={() => onToggleType(type)}
          />
        ))}
      </div>

      <div className="flex gap-2 border-t border-border-light pt-2.5">
        <FilterToggle
          label="NA Only"
          icon={'\u{1F33F}'}
          active={naOnly}
          onClick={onToggleNA}
          variant="na"
        />
        <FilterToggle
          label="My Tried List"
          icon={'\u2713'}
          active={showTriedOnly}
          onClick={onToggleTried}
          variant="tried"
        />
      </div>
    </div>
  );
}
