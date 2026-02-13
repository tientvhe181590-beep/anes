import { Outlet, useLocation } from 'react-router';
import { usePageTracking } from '@/shared/hooks/usePageTracking';

/**
 * Root layout that wraps all routes to enable page-level tracking.
 * Must be rendered inside the React Router context.
 */
export function RootLayout() {
  const { pathname } = useLocation();
  usePageTracking(pathname);

  return <Outlet />;
}
