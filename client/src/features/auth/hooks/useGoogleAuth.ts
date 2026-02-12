import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/app/store';
import { googleAuthApi } from '../api/auth.api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function useGoogleAuth() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: googleAuthApi,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      if (data.user.onboardingComplete) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message ?? 'Google sign-in failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    },
  });

  const initiateGoogleSignIn = useCallback(() => {
    setError(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('Google Sign-In is not configured.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setError('Google Sign-In SDK not loaded.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        mutation.mutate({ idToken: response.credential });
      },
    });

    window.google.accounts.id.prompt();
  }, [mutation]);

  return {
    initiateGoogleSignIn,
    error,
    isLoading: mutation.isPending,
  };
}
