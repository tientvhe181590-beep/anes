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

  // Allow app to render even if RxDB fails (landing screen doesn't need it)
  // Database context will be null, features requiring DB will handle gracefully
  if (error) {
    console.warn(
      '[RxDB] Database initialization failed, app will run without persistent storage:',
      error.message,
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
