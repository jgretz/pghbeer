import {useState, useCallback} from 'react';
import type {BeverageType, FilterState} from '../lib/types';

export function useFilterState(totalTypes: number) {
  const [search, setSearch] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<BeverageType>>(new Set());
  const [naOnly, setNaOnly] = useState(false);
  const [showTriedOnly, setShowTriedOnly] = useState(false);

  const toggleType = useCallback(
    (type: BeverageType) => {
      setActiveTypes((prev) => {
        const next = new Set(prev);
        if (next.has(type)) {
          next.delete(type);
        } else {
          next.add(type);
        }
        // collapse back to "All" if user selected every type
        if (next.size === totalTypes) return new Set<BeverageType>();
        return next;
      });
    },
    [totalTypes],
  );

  const clearTypes = useCallback(() => {
    setActiveTypes(new Set());
  }, []);

  const toggleNA = useCallback(() => setNaOnly((p) => !p), []);
  const toggleTried = useCallback(() => setShowTriedOnly((p) => !p), []);
  const clearSearch = useCallback(() => setSearch(''), []);

  const state: FilterState = {search, activeTypes, naOnly, showTriedOnly};
  const hasAnyFilter = search !== '' || activeTypes.size > 0 || naOnly || showTriedOnly;

  return {
    state,
    hasAnyFilter,
    setSearch,
    clearSearch,
    toggleType,
    clearTypes,
    toggleNA,
    toggleTried,
  } as const;
}
