import {useState, useCallback, useRef} from 'react';
import {useMutation} from '@tanstack/react-query';
import {STORAGE_KEYS, EVENT_ID} from '../lib/constants';
import {postStats} from '../lib/api';
import {useUserId} from './useUserId';

function loadTried(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tried);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveTried(tried: Set<string>): void {
  localStorage.setItem(STORAGE_KEYS.tried, JSON.stringify(Array.from(tried)));
}

export function useTriedSet() {
  const [tried, setTried] = useState<Set<string>>(loadTried);
  const userId = useUserId();

  const {mutate} = useMutation({
    mutationFn: postStats,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  const toggle = useCallback(
    (key: string, beerId: number) => {
      setTried((prev) => {
        const next = new Set(prev);
        const tasted = !next.has(key);
        if (tasted) {
          next.add(key);
        } else {
          next.delete(key);
        }
        saveTried(next);

        mutateRef.current({
          beerId,
          eventId: Number(EVENT_ID),
          userId,
          tasted,
        });

        return next;
      });
    },
    [userId],
  );

  return {tried, toggle} as const;
}
