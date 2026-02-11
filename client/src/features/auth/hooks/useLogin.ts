/**
 * useLogin hook — TanStack Query mutation for login flow.
 * Handles API call, token storage, navigation, and error mapping.
 */
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginApi } from '../api/auth-api';
import { useAuthStore } from './useAuthStore';
import type { LoginCredentials } from '../types/auth';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
      // Navigate to dashboard (or onboarding if profile incomplete)
      navigate('/dashboard');
    },
  });
}

/**
 * Extract a user-friendly error message from a login mutation error.
 */
export function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return 'Incorrect email or password.';
    }
    if (status === 400) {
      // Validation error from backend
      const apiError = error.response?.data?.error;
      if (apiError?.message) {
        return apiError.message as string;
      }
      return 'Please check your input and try again.';
    }
    if (!navigator.onLine) {
      return 'You are offline. Please check your connection.';
    }

    return 'Service unavailable. Please try again later.';
  }

  return 'An unexpected error occurred.';
}
