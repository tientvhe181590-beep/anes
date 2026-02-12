import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { MainLayout } from '@/app/MainLayout';
import { LandingPage } from '@/app/pages/LandingPage';
import { LoginPage } from '@/app/pages/LoginPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
import { OnboardingFlow } from '@/app/pages/OnboardingFlow';
import { DashboardScreen } from '@/app/pages/DashboardScreen';
import { PlaceholderPage } from '@/app/pages/PlaceholderPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/landing" replace />,
  },
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <SignUpPage />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute requireOnboardingComplete={false}>
        <OnboardingFlow />
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardScreen />,
      },
      {
        path: '/workouts',
        element: <PlaceholderPage title="Workouts" />,
      },
      {
        path: '/nutrition',
        element: <PlaceholderPage title="Nutrition" />,
      },
      {
        path: '/chat',
        element: <PlaceholderPage title="Chat" />,
      },
      {
        path: '/profile',
        element: <PlaceholderPage title="Profile" />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
