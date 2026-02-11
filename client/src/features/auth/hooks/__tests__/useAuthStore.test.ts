/**
 * useAuthStore tests — validates Zustand auth store behavior.
 * Tests login, logout, and init (rehydration from localStorage).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../useAuthStore';
import type { UserInfo } from '../../types/auth';

const mockUser: UserInfo = {
  id: '123-abc',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'member',
  membershipTier: 'Free',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
    });
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('login() stores tokens and user', () => {
    useAuthStore.getState().login('access-tok', 'refresh-tok', mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('anes_access_token')).toBe('access-tok');
    expect(localStorage.getItem('anes_refresh_token')).toBe('refresh-tok');
    expect(localStorage.getItem('anes_user')).toBe(JSON.stringify(mockUser));
  });

  it('logout() clears everything', () => {
    // Login first
    useAuthStore.getState().login('access-tok', 'refresh-tok', mockUser);

    // Then logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('anes_access_token')).toBeNull();
    expect(localStorage.getItem('anes_refresh_token')).toBeNull();
    expect(localStorage.getItem('anes_user')).toBeNull();
  });

  it('init() rehydrates from localStorage when tokens exist', () => {
    localStorage.setItem('anes_access_token', 'saved-token');
    localStorage.setItem('anes_user', JSON.stringify(mockUser));

    useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitialized).toBe(true);
  });

  it('init() stays unauthenticated when no tokens', () => {
    useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  it('init() clears corrupted user data', () => {
    localStorage.setItem('anes_access_token', 'tok');
    localStorage.setItem('anes_user', 'invalid-json{{{');

    useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
    expect(localStorage.getItem('anes_access_token')).toBeNull();
  });
});
