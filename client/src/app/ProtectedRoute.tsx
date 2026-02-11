import { Navigate } from "react-router";
import type { ReactElement } from "react";
import { useAuthStore } from "@/app/store";

interface ProtectedRouteProps {
  requireOnboardingComplete?: boolean;
  children: ReactElement;
}

export function ProtectedRoute({
  requireOnboardingComplete = true,
  children,
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboardingComplete && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboardingComplete && onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
