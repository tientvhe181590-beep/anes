import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// Lazy-loaded feature routes
const LandingPage = lazy(() => import('@/features/auth/components/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'));
const DashboardScreen = lazy(() => import('@/features/dashboard/DashboardScreen'));

/**
 * Application router configuration.
 * Routes are lazy-loaded per feature for code-splitting.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/dashboard',
    Component: DashboardScreen,
  },
  // { path: '/register', Component: lazy(() => import('@/features/auth/components/RegisterForm')) },
  //
  // Protected routes (require auth) will be wrapped in a layout
  // { path: '/dashboard', Component: lazy(() => import('@/features/dashboard/DashboardView')) },
  // { path: '/workouts/*', Component: lazy(() => import('@/features/workouts/WorkoutsLayout')) },
  // { path: '/nutrition/*', Component: lazy(() => import('@/features/nutrition/NutritionLayout')) },
  // { path: '/chat', Component: lazy(() => import('@/features/ai-coach/ChatView')) },
]);
