import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// Lazy-loaded feature routes
const LandingPage = lazy(() => import('@/features/auth/components/LandingPage'));
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'));
const DashboardScreen = lazy(() => import('@/features/dashboard/DashboardScreen'));
const MainLayout = lazy(() => import('@/MainLayout'));

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
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        Component: DashboardScreen,
      },
      {
        path: 'workouts',
        element: <div>Workouts Screen (Placeholder)</div>,
      },
      {
        path: 'nutrition',
        element: <div>Nutrition Screen (Placeholder)</div>,
      },
      {
        path: 'chat',
        element: <div>Chat AI Screen (Placeholder)</div>,
      },
      {
        path: 'profile',
        element: <div>Profile Screen (Placeholder)</div>,
      },
    ],
  },
  // { path: '/register', Component: lazy(() => import('@/features/auth/components/RegisterForm')) },
  //
  // Protected routes (require auth) will be wrapped in a layout
  // { path: '/dashboard', Component: lazy(() => import('@/features/dashboard/DashboardView')) },
  // { path: '/workouts/*', Component: lazy(() => import('@/features/workouts/WorkoutsLayout')) },
  // { path: '/nutrition/*', Component: lazy(() => import('@/features/nutrition/NutritionLayout')) },
  // { path: '/chat', Component: lazy(() => import('@/features/ai-coach/ChatView')) },
]);
