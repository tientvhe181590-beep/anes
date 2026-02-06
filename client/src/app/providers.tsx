import { type ReactNode, useEffect, useState, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/query-client';
import { DatabaseContext, getDatabase, type AnesDatabase } from './rxdb';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root provider tree.
 * Wraps the app with TanStack Query + RxDB database context.
 */
export function Providers({ children }: ProvidersProps) {
  const [db, setDb] = useState<AnesDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDatabase()
      .then(setDb)
      .catch((err: unknown) => {
        console.error('[RxDB] Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Database initialization failed'));
      });
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">Database Error</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button
            className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-500">Initializing ANES...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseContext.Provider value={db}>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          }
        >
          {children}
        </Suspense>
      </DatabaseContext.Provider>
    </QueryClientProvider>
  );
}
