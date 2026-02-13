import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as posthogModule from '@/shared/lib/posthog';
import { identifyUser, resetIdentity } from '@/shared/lib/analytics';
import type { UserProfile } from '@/app/store';

const mockPostHog = {
  identify: vi.fn(),
  reset: vi.fn(),
  reloadFeatureFlags: vi.fn(),
  capture: vi.fn(),
};

describe('PostHog identity management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(posthogModule, 'getPostHog').mockReturnValue(mockPostHog as never);
  });

  it('calls posthog.identify with user data on sign-in', () => {
    const user: UserProfile = {
      id: 42,
      email: 'user@example.com',
      fullName: 'Test User',
      onboardingComplete: false,
    };

    identifyUser(user);

    expect(mockPostHog.identify).toHaveBeenCalledOnce();
    expect(mockPostHog.identify).toHaveBeenCalledWith('42', {
      email: 'user@example.com',
      onboardingComplete: false,
    });
  });

  it('reloads feature flags after identification', () => {
    const user: UserProfile = {
      id: 1,
      email: 'a@b.com',
      fullName: 'A',
      onboardingComplete: true,
    };

    identifyUser(user);

    expect(mockPostHog.reloadFeatureFlags).toHaveBeenCalledOnce();
  });

  it('calls posthog.reset on sign-out', () => {
    resetIdentity();
    expect(mockPostHog.reset).toHaveBeenCalledOnce();
  });
});

describe('PostHog identity when PostHog is unavailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(posthogModule, 'getPostHog').mockReturnValue(null);
  });

  it('does not throw when getPostHog returns null', () => {
    const user: UserProfile = {
      id: 1,
      email: 'a@b.com',
      fullName: 'A',
      onboardingComplete: false,
    };

    expect(() => identifyUser(user)).not.toThrow();
    expect(() => resetIdentity()).not.toThrow();
  });
});
