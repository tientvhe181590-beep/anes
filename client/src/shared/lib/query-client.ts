import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus in dev, allow in prod
      refetchOnWindowFocus: import.meta.env.PROD,
      // Retry once on failure
      retry: 1,
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});
