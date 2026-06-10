import {useQuery} from '@tanstack/react-query';
import {fetchEventMap} from '../lib/api';
import {EVENT_ID} from '../lib/constants';

// Short stale time: brewery-to-slot assignments change rapidly during day-of
// setup, so the map should refetch often (and on window focus).
export function useEventMap() {
  return useQuery({
    queryKey: ['eventMap', EVENT_ID],
    queryFn: fetchEventMap,
    staleTime: 30 * 1000,
    networkMode: 'offlineFirst',
  });
}
