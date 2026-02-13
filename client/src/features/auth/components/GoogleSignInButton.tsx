import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/app/store';
import { getE2eAuthOverrides } from '@/shared/lib/e2e-auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/shared/lib/firebase';
import { firebaseAuthApi } from '../api/auth.api';

interface GoogleSignInButtonProps {
  label?: string;
  className?: string;
}

export function GoogleSignInButton({
  label = 'Sign in with Google',
  className,
}: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const { setFirebaseUser, firebaseEnabled } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);

    const e2e = getE2eAuthOverrides();

    if (e2e?.signInWithGooglePopup) {
      setIsLoading(true);
      try {
        const result = await e2e.signInWithGooglePopup();
        const idToken = await result.user.getIdToken();
        const response = await firebaseAuthApi({ idToken });
        setFirebaseUser(response.user, idToken);

        if (response.user.onboardingComplete) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } catch {
        setError('Google sign-in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!isFirebaseConfigured()) {
      setError('Google Sign-In is not configured.');
      return;
    }

    setIsLoading(true);

    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      // Exchange the Firebase token with our backend to get/create user profile
      const response = await firebaseAuthApi({ idToken });

      // Store user profile in Zustand
      setFirebaseUser(response.user, idToken);

      // Navigate based on onboarding status
      if (response.user.onboardingComplete) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err: unknown) {
      // Handle popup cancel silently (user closed popup)
      if (isFirebasePopupCancelled(err)) {
        setIsLoading(false);
        return;
      }

      if (err instanceof AxiosError) {
        // Server-side error — sign out Firebase and show error
        const msg = err.response?.data?.message ?? 'Google sign-in failed. Please try again.';
        setError(msg);
        try {
          const auth = getFirebaseAuth();
          await auth.signOut();
        } catch {
          // ignore sign-out errors
        }
      } else if (err instanceof Error && err.message.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setFirebaseUser, firebaseEnabled]);

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className={
          className ??
          'flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-strong)] bg-transparent text-base font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50'
        }
        aria-label={label}
      >
        {isLoading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--text-primary)] border-t-transparent" />
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-[var(--negative)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Check if the error is a Firebase popup cancellation (user closed the popup).
 */
function isFirebasePopupCancelled(err: unknown): boolean {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code;
    return (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/user-cancelled'
    );
  }
  return false;
}
