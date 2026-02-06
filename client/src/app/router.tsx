import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// Lazy-loaded feature routes
const LandingPage = lazy(() => import('@/features/auth/components/LandingPage'));

/**
 * Application router configuration.
 * Routes are lazy-loaded per feature for code-splitting.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  // Auth routes will be added here
  // { path: '/login', Component: lazy(() => import('@/features/auth/components/LoginForm')) },
  // { path: '/register', Component: lazy(() => import('@/features/auth/components/RegisterForm')) },
  //
  // Protected routes (require auth) will be wrapped in a layout
  // { path: '/dashboard', Component: lazy(() => import('@/features/dashboard/DashboardView')) },
  // { path: '/workouts/*', Component: lazy(() => import('@/features/workouts/WorkoutsLayout')) },
  // { path: '/nutrition/*', Component: lazy(() => import('@/features/nutrition/NutritionLayout')) },
  // { path: '/chat', Component: lazy(() => import('@/features/ai-coach/ChatView')) },
]);
