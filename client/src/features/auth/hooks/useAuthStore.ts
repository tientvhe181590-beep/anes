/**
 * Auth Zustand store — manages authentication state.
 * Tokens persisted in localStorage; user state in Zustand.
 *
 * Key design decisions:
 * - localStorage key matches api-client interceptor ('anes_access_token')
 * - init() rehydrates from localStorage on app start
 * - logout() clears everything and redirects to /login
 */
import { create } from 'zustand';
import type { UserInfo } from '../types/auth';

const ACCESS_TOKEN_KEY = 'anes_access_token';
const REFRESH_TOKEN_KEY = 'anes_refresh_token';
const USER_KEY = 'anes_user';

interface AuthState {
  /** Currently authenticated user, null if guest */
  user: UserInfo | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state has been initialized from localStorage */
  isInitialized: boolean;

  /** Store tokens + user after successful login/register */
  login: (accessToken: string, refreshToken: string, user: UserInfo) => void;
  /** Clear all auth state and redirect to login */
  logout: () => void;
  /** Rehydrate auth state from localStorage (call on app start) */
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  login: (accessToken, refreshToken, user) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, isAuthenticated: false });
  },

  init: () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserInfo;
        set({ user, isAuthenticated: true, isInitialized: true });
        return;
      } catch {
        // Corrupted data — clear and continue as guest
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    set({ user: null, isAuthenticated: false, isInitialized: true });
  },
}));
