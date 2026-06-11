import {useEffect} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {fetchDataVersion} from '../lib/api';
import {EVENT_ID, STORAGE_KEYS} from '../lib/constants';

// Reaches an admin "bust cache" through to attendee phones without polling.
// On page load, reconnect, and tab refocus it fetches the tiny server version
// and compares it to the value this device last saw; only on a real change does
// it invalidate the cached beer list + map so they refetch. Focus is safe to
// enable here (unlike the heavy data queries) — it's a single timestamp, and it
// cascades into the expensive refetch only when the version actually moved.
export function useDataVersionSync() {
  const qc = useQueryClient();

  const {data} = useQuery({
    queryKey: ['dataVersion', EVENT_ID],
    queryFn: fetchDataVersion,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!data?.version) return;
    const lastSeen = localStorage.getItem(STORAGE_KEYS.dataVersion);
    if (lastSeen === data.version) return;

    localStorage.setItem(STORAGE_KEYS.dataVersion, data.version);
    // First-ever load (no prior version): the initial fetch already holds
    // current data, so only force a refetch when the version genuinely changed.
    if (lastSeen !== null) {
      qc.invalidateQueries({queryKey: ['eventData', EVENT_ID]});
      qc.invalidateQueries({queryKey: ['eventMap', EVENT_ID]});
    }
  }, [data?.version, qc]);
}
