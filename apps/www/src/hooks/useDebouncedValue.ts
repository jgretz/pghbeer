import {useEffect, useState} from 'react';

// Returns a copy of `value` that only updates after `delayMs` of quiet.
// Keeps the search input responsive while the O(n) filter pass runs at most
// once per pause in typing.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
