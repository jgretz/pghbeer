import {useEffect, useState} from 'react';

export type Orientation = 'portrait' | 'landscape';

// Tracks viewport orientation via matchMedia. Returns null until mounted so SSR
// and the first client render agree (no hydration mismatch); callers treat null
// as "don't assume portrait" and render the default (map) view.
export function useOrientation(): Orientation | null {
  const [orientation, setOrientation] = useState<Orientation | null>(null);

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)');
    const update = () => setOrientation(mql.matches ? 'portrait' : 'landscape');
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return orientation;
}
