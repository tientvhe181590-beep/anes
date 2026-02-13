import { useEffect, useRef } from 'react';
import { trackPageView } from '@/shared/lib/analytics';

/**
 * Track page views on route changes. Call this hook inside a component
 * that is rendered within a React Router context (e.g., inside the
 * RouterProvider tree).
 */
export function usePageTracking(pathname: string): void {
  const previousPath = useRef<string>('');

  useEffect(() => {
    if (pathname && pathname !== previousPath.current) {
      const referrer = previousPath.current || document.referrer;
      trackPageView(pathname, referrer);
      previousPath.current = pathname;
    }
  }, [pathname]);
}
