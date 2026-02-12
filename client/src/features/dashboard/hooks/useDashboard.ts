import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../api/dashboard.api';

export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
