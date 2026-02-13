import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------- Mock posthog-js BEFORE importing the module under test ----------
const mockInit = vi.fn();
const mockDebug = vi.fn();

vi.mock('posthog-js', () => ({
  default: {
    init: mockInit,
    __loaded: false,
  },
}));

// Dynamically import so the mock is in place
let initPostHog: typeof import('@/shared/lib/posthog').initPostHog;
let isPostHogConfigured: typeof import('@/shared/lib/posthog').isPostHogConfigured;
let hasAnalyticsConsent: typeof import('@/shared/lib/posthog').hasAnalyticsConsent;

describe('PostHog init', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('VITE_POSTHOG_API_KEY', '');
    vi.stubEnv('VITE_POSTHOG_HOST', '');
    localStorage.clear();

    // Re-mock after reset
    vi.mock('posthog-js', () => ({
      default: {
        init: mockInit,
        __loaded: false,
      },
    }));

    const mod = await import('@/shared/lib/posthog');
    initPostHog = mod.initPostHog;
    isPostHogConfigured = mod.isPostHogConfigured;
    hasAnalyticsConsent = mod.hasAnalyticsConsent;

    mockInit.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null and does not call posthog.init when API key is missing', () => {
    localStorage.setItem('anes.analytics_consent', 'granted');
    const result = initPostHog();
    expect(result).toBeNull();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('returns null when consent is denied', async () => {
    vi.stubEnv('VITE_POSTHOG_API_KEY', 'phc_test_key');
    localStorage.setItem('anes.analytics_consent', 'denied');

    // Need fresh module to pick up new env
    vi.resetModules();
    vi.mock('posthog-js', () => ({
      default: { init: mockInit, __loaded: false },
    }));
    const mod = await import('@/shared/lib/posthog');

    const result = mod.initPostHog();
    expect(result).toBeNull();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('returns null when no consent is set (first visit)', async () => {
    vi.stubEnv('VITE_POSTHOG_API_KEY', 'phc_test_key');
    // localStorage has no consent key

    vi.resetModules();
    vi.mock('posthog-js', () => ({
      default: { init: mockInit, __loaded: false },
    }));
    const mod = await import('@/shared/lib/posthog');

    const result = mod.initPostHog();
    expect(result).toBeNull();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('calls posthog.init with correct options when configured and consent granted', async () => {
    vi.stubEnv('VITE_POSTHOG_API_KEY', 'phc_test_key');
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://eu.posthog.com');
    localStorage.setItem('anes.analytics_consent', 'granted');

    vi.resetModules();
    vi.mock('posthog-js', () => {
      const ph = {
        init: mockInit,
        __loaded: false,
        debug: mockDebug,
      };
      return { default: ph };
    });
    const mod = await import('@/shared/lib/posthog');

    const result = mod.initPostHog();
    expect(result).not.toBeNull();
    expect(mockInit).toHaveBeenCalledOnce();
    expect(mockInit).toHaveBeenCalledWith(
      'phc_test_key',
      expect.objectContaining({
        api_host: 'https://eu.posthog.com',
        autocapture: false,
        capture_pageview: false,
        person_profiles: 'identified_only',
      }),
    );
  });

  it('isPostHogConfigured returns false when env var is missing', () => {
    expect(isPostHogConfigured()).toBe(false);
  });

  it('hasAnalyticsConsent returns true only when granted', () => {
    expect(hasAnalyticsConsent()).toBe(false);
    localStorage.setItem('anes.analytics_consent', 'granted');
    expect(hasAnalyticsConsent()).toBe(true);
    localStorage.setItem('anes.analytics_consent', 'denied');
    expect(hasAnalyticsConsent()).toBe(false);
  });
});
