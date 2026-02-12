import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AxiosError, type AxiosResponse } from 'axios';
import { GoogleSignInButton } from '../GoogleSignInButton';

// Mock navigate
const navigateMock = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Mock firebase/auth
const signInWithPopupMock = vi.fn();
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(() => ({ addScope: vi.fn() })),
  signInWithPopup: (...args: unknown[]) => signInWithPopupMock(...args),
}));

// Mock firebase lib
const mockAuth = { signOut: vi.fn() };
vi.mock('@/shared/lib/firebase', () => ({
  getFirebaseAuth: () => mockAuth,
  isFirebaseConfigured: () => true,
}));

// Mock store
const setFirebaseUserMock = vi.fn();
vi.mock('@/app/store', () => ({
  useAuthStore: () => ({
    setFirebaseUser: setFirebaseUserMock,
    firebaseEnabled: true,
  }),
}));

// Mock API
const firebaseAuthApiMock = vi.fn();
vi.mock('../../api/auth.api', () => ({
  firebaseAuthApi: (...args: unknown[]) => firebaseAuthApiMock(...args),
}));

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button with default label', () => {
    render(
      <MemoryRouter>
        <GoogleSignInButton />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <MemoryRouter>
        <GoogleSignInButton label="Continue with Google" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
  });

  it('handles successful sign-in and navigates to dashboard', async () => {
    const user = userEvent.setup();

    signInWithPopupMock.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('firebase-id-token') },
    });
    firebaseAuthApiMock.mockResolvedValue({
      user: { id: 1, email: 'user@example.com', onboardingComplete: true },
    });

    render(
      <MemoryRouter>
        <GoogleSignInButton />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /sign in with google/i }));

    await waitFor(() => {
      expect(firebaseAuthApiMock).toHaveBeenCalledWith({ idToken: 'firebase-id-token' });
      expect(setFirebaseUserMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('navigates to onboarding when user has not completed it', async () => {
    const user = userEvent.setup();

    signInWithPopupMock.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('firebase-id-token') },
    });
    firebaseAuthApiMock.mockResolvedValue({
      user: { id: 2, email: 'new@example.com', onboardingComplete: false },
    });

    render(
      <MemoryRouter>
        <GoogleSignInButton />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /sign in with google/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/onboarding', { replace: true });
    });
  });

  it('silently handles popup cancel', async () => {
    const user = userEvent.setup();

    signInWithPopupMock.mockRejectedValue({ code: 'auth/popup-closed-by-user' });

    render(
      <MemoryRouter>
        <GoogleSignInButton />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /sign in with google/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('shows error on server failure', async () => {
    const user = userEvent.setup();

    signInWithPopupMock.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('firebase-id-token') },
    });
    const axiosErr = new AxiosError(
      'fail',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      { data: { message: 'Server error occurred' }, status: 401 } as AxiosResponse,
    );
    firebaseAuthApiMock.mockRejectedValue(axiosErr);

    render(
      <MemoryRouter>
        <GoogleSignInButton />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /sign in with google/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server error occurred');
    });
  });
});
