import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Auth, Unsubscribe, User as FirebaseUser } from 'firebase/auth';

// Capture the callback passed to onAuthStateChanged
let authStateCallback: ((user: FirebaseUser | null) => void) | null = null;
const mockUnsubscribe = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(
    (_auth: Auth, callback: (user: FirebaseUser | null) => void): Unsubscribe => {
      authStateCallback = callback;
      return mockUnsubscribe;
    },
  ),
  getAuth: vi.fn(() => ({
    currentUser: null,
    signOut: vi.fn(() => Promise.resolve()),
  })),
}));

import { useAuthStore } from '@/app/store';

describe('useAuthStore — Firebase auth integration', () => {
  const USER_KEY = 'anes.user';
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    onboardingComplete: false,
  };

  beforeEach(() => {
    authStateCallback = null;
    mockUnsubscribe.mockClear();
    localStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      firebaseToken: null,
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
      firebaseEnabled: false,
      isInitializing: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initFirebaseAuth sets firebaseEnabled and isInitializing', () => {
    const mockAuth = {} as Auth;
    useAuthStore.getState().initFirebaseAuth(mockAuth);

    const state = useAuthStore.getState();
    expect(state.firebaseEnabled).toBe(true);
  });

  it('initFirebaseAuth returns unsubscribe function', () => {
    const mockAuth = {} as Auth;
    const unsubscribe = useAuthStore.getState().initFirebaseAuth(mockAuth);

    expect(typeof unsubscribe).toBe('function');
  });

  it('onAuthStateChanged callback: signed-in user sets auth state', async () => {
    const mockAuth = {} as Auth;
    useAuthStore.getState().initFirebaseAuth(mockAuth);

    // Simulate a cached user profile in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

    // Simulate Firebase emitting a signed-in user
    const firebaseUser = {
      uid: 'firebase-uid-123',
      email: 'test@example.com',
      getIdToken: vi.fn(() => Promise.resolve('firebase-id-token-abc')),
    } as unknown as FirebaseUser;

    expect(authStateCallback).not.toBeNull();
    await authStateCallback!(firebaseUser);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.firebaseToken).toBe('firebase-id-token-abc');
    expect(state.isInitializing).toBe(false);
    // Legacy tokens should be cleared
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('onAuthStateChanged callback: sign-out clears auth state', async () => {
    const mockAuth = {} as Auth;

    // Set up authenticated state first
    useAuthStore.setState({
      firebaseToken: 'some-token',
      isAuthenticated: true,
      user: mockUser,
      firebaseEnabled: true,
    });

    useAuthStore.getState().initFirebaseAuth(mockAuth);

    // Simulate Firebase emitting sign-out (null user)
    expect(authStateCallback).not.toBeNull();
    await authStateCallback!(null);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.firebaseToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isInitializing).toBe(false);
  });

  it('setFirebaseUser persists user to localStorage', () => {
    useAuthStore.getState().setFirebaseUser(mockUser, 'token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.firebaseToken).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem(USER_KEY)).toBe(JSON.stringify(mockUser));
  });

  it('setFirebaseUser with null clears localStorage', () => {
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    useAuthStore.getState().setFirebaseUser(null, null);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('firebaseLogout calls auth.signOut and clears state', async () => {
    const mockSignOut = vi.fn(() => Promise.resolve());
    const mockAuth = { signOut: mockSignOut } as unknown as Auth;

    useAuthStore.setState({
      firebaseToken: 'token',
      user: mockUser,
      isAuthenticated: true,
      firebaseEnabled: true,
    });
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

    await useAuthStore.getState().firebaseLogout(mockAuth);

    expect(mockSignOut).toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.firebaseToken).toBeNull();
    expect(state.user).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('getActiveToken returns firebaseToken when firebaseEnabled', () => {
    useAuthStore.setState({
      firebaseEnabled: true,
      firebaseToken: 'fb-token',
      accessToken: 'legacy-token',
    });

    expect(useAuthStore.getState().getActiveToken()).toBe('fb-token');
  });

  it('getActiveToken returns accessToken when not firebaseEnabled', () => {
    useAuthStore.setState({
      firebaseEnabled: false,
      firebaseToken: null,
      accessToken: 'legacy-token',
    });

    expect(useAuthStore.getState().getActiveToken()).toBe('legacy-token');
  });
});
