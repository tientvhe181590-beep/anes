import { create } from 'zustand';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  onboardingComplete: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  init: () => Promise<void>;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  onboardingComplete: false,
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
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
    });
  },
}));

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: {},
  update: (values) => set((state) => ({ data: { ...state.data, ...values } })),
  reset: () => set({ data: {} }),
}));
