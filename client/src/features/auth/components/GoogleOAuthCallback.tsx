import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store';
import { googleAuthApi } from '../api/auth.api';

export function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens, setUser } = useAuthStore();

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
    onError: () => {
      navigate('/login', { replace: true });
    },
  });

  useEffect(() => {
    const credential = searchParams.get('credential');
    if (credential) {
      mutation.mutate({ idToken: credential });
    } else {
      navigate('/login', { replace: true });
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-[var(--text-secondary)]">Processing Google authentication…</p>
      </div>
    </main>
  );
}
