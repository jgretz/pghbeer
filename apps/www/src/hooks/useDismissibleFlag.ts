import {useCallback, useEffect, useState} from 'react';

// A one-time dismissal persisted in localStorage. `dismissed` starts false (so
// SSR and the first client render agree) and syncs from storage on mount, so a
// previously-dismissed flag stays hidden without a hydration mismatch.
export function useDismissibleFlag(key: string): {
  dismissed: boolean;
  dismiss: () => void;
} {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(key) === '1') setDismissed(true);
  }, [key]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(key, '1');
  }, [key]);

  return {dismissed, dismiss};
}
