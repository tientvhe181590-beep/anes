import { create } from 'zustand';
import type { Auth, Unsubscribe, User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  onboardingComplete: boolean;
}

interface AuthState {
  /** Legacy JWT access token — null when using Firebase auth */
  accessToken: string | null;
  /** Legacy JWT refresh token — null when using Firebase auth */
  refreshToken: string | null;
  /** Firebase ID token — null when using legacy JWT auth */
  firebaseToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  /** Whether we're using Firebase auth vs legacy JWT */
  firebaseEnabled: boolean;
  /** True while the initial auth state is being resolved */
  isInitializing: boolean;

  // Legacy JWT methods
  init: () => Promise<void>;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;

  // Firebase methods
  initFirebaseAuth: (auth: Auth) => Unsubscribe;
  setFirebaseToken: (token: string | null) => void;
  setFirebaseUser: (user: UserProfile | null, token: string | null) => void;
  firebaseLogout: (auth: Auth) => Promise<void>;

  /** Get the current bearer token (Firebase or legacy) */
  getActiveToken: () => string | null;
}

interface OnboardingState {
  data: Record<string, unknown>;
  update: (values: Record<string, unknown>) => void;
  reset: () => void;
}

const ACCESS_TOKEN_KEY = 'anes.accessToken';
const REFRESH_TOKEN_KEY = 'anes.refreshToken';
const USER_KEY = 'anes.user';

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp ? payload.exp * 1000 : 0;
    return exp > 0 && Date.now() >= exp;
  } catch {
    return true;
  }
};

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule a proactive Firebase token refresh 5 minutes before expiry.
 * Firebase tokens expire after ~1 hour by default.
 */
function scheduleTokenRefresh(
  firebaseUser: FirebaseUser,
  set: (partial: Partial<AuthState>) => void,
): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  // Refresh 5 minutes before expiry (55 minutes from now)
  const REFRESH_INTERVAL_MS = 55 * 60 * 1000;

  refreshTimer = setTimeout(async () => {
    try {
      const token = await firebaseUser.getIdToken(true); // force refresh
      set({ firebaseToken: token });
      // Schedule the next refresh
      scheduleTokenRefresh(firebaseUser, set);
    } catch {
      // Token refresh failed — user will be re-prompted on next API call
    }
  }, REFRESH_INTERVAL_MS);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  firebaseToken: null,
  user: null,
  isAuthenticated: false,
  onboardingComplete: false,
  firebaseEnabled: false,
  isInitializing: true,

  // ---------- Legacy JWT ----------
  init: async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as UserProfile) : null;

    if (accessToken && !isTokenExpired(accessToken)) {
      set({
        accessToken,
        refreshToken,
        user,
        isAuthenticated: true,
        onboardingComplete: user?.onboardingComplete ?? false,
        isInitializing: false,
      });
      return;
    }

    if (refreshToken) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const payload = await response.json();
          const data = payload?.data;
          const nextAccess = data?.accessToken ?? null;
          const nextRefresh = data?.refreshToken ?? null;
          get().setTokens(nextAccess, nextRefresh);
          set({
            user,
            isAuthenticated: Boolean(nextAccess),
            onboardingComplete: user?.onboardingComplete ?? false,
            isInitializing: false,
          });
          return;
        }
      } catch {
        // fall through to logout
      }
    }

    get().logout();
  },
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    set({ accessToken, refreshToken });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ user, onboardingComplete: user?.onboardingComplete ?? false });
  },
  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      firebaseToken: null,
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
      isInitializing: false,
    });
  },

  // ---------- Firebase Auth ----------
  initFirebaseAuth: (auth: Auth) => {
    set({ firebaseEnabled: true, isInitializing: true });

    // Restore cached user while Firebase resolves
    const userRaw = localStorage.getItem(USER_KEY);
    if (userRaw) {
      const cachedUser = JSON.parse(userRaw) as UserProfile;
      set({
        user: cachedUser,
        onboardingComplete: cachedUser.onboardingComplete,
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in — get a fresh ID token
        const token = await firebaseUser.getIdToken();
        const cachedRaw = localStorage.getItem(USER_KEY);
        const cachedProfile = cachedRaw ? (JSON.parse(cachedRaw) as UserProfile) : null;

        set({
          firebaseToken: token,
          isAuthenticated: true,
          user: cachedProfile,
          onboardingComplete: cachedProfile?.onboardingComplete ?? false,
          isInitializing: false,
          // Clear legacy tokens
          accessToken: null,
          refreshToken: null,
        });

        // Set up proactive token refresh (5 min before expiry)
        scheduleTokenRefresh(firebaseUser, set);
      } else {
        // User is signed out
        localStorage.removeItem(USER_KEY);
        set({
          firebaseToken: null,
          user: null,
          isAuthenticated: false,
          onboardingComplete: false,
          isInitializing: false,
          accessToken: null,
          refreshToken: null,
        });
      }
    });

    return unsubscribe;
  },

  setFirebaseToken: (token) => {
    set({ firebaseToken: token });
  },

  setFirebaseUser: (user, token) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({
      user,
      firebaseToken: token,
      isAuthenticated: Boolean(user && token),
      onboardingComplete: user?.onboardingComplete ?? false,
    });
  },

  firebaseLogout: async (auth: Auth) => {
    await auth.signOut();
    localStorage.removeItem(USER_KEY);
    set({
      firebaseToken: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
    });
  },

  // ---------- Shared ----------
  getActiveToken: () => {
    const state = get();
    return state.firebaseEnabled ? state.firebaseToken : state.accessToken;
  },
}));

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: {},
  update: (values) => set((state) => ({ data: { ...state.data, ...values } })),
  reset: () => set({ data: {} }),
}));
