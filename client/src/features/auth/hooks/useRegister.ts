/**
 * useRegister hook — TanStack Query mutation for registration flow.
 * SRS 3.1.1.3 — Register new user, persist tokens, redirect to onboarding.
 */
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { registerApi } from '../api/auth-api';
import { useAuthStore } from './useAuthStore';
import type { RegisterCredentials } from '../types/auth';

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => registerApi(credentials),
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
      navigate('/onboarding');
    },
  });
}

/**
 * Maps API errors to user-friendly messages for registration.
 */
export function getRegisterErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.error?.message as string | undefined;

    if (status === 409 || (status === 400 && apiMessage?.toLowerCase().includes('already'))) {
      return 'This email is already registered. Try logging in.';
    }
    if (status === 400) {
      if (apiMessage) return apiMessage;
      return 'Please check your input and try again.';
    }
    if (!navigator.onLine) return 'You are offline. Please check your connection.';
    return 'Service unavailable. Please try again later.';
  }
  return 'An unexpected error occurred.';
}
