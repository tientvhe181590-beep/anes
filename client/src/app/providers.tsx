import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/app/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    void init();
  }, [init]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
