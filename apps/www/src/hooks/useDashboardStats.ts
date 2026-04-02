import {useQuery} from '@tanstack/react-query';
import {fetchDashboardStats} from '../lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30_000,
    staleTime: 15_000,
    gcTime: 5 * 60 * 1000,
  });
}
