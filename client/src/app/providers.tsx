import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/app/store';
import { initFirebase, isFirebaseConfigured } from '@/shared/lib/firebase';

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
  const initFirebaseAuth = useAuthStore((state) => state.initFirebaseAuth);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      // Firebase mode — initialize Firebase and subscribe to auth state changes
      const { auth } = initFirebase();
      const unsubscribe = initFirebaseAuth(auth);
      return unsubscribe;
    } else {
      // Legacy JWT mode — hydrate from localStorage
      void init();
    }
  }, [init, initFirebaseAuth]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
