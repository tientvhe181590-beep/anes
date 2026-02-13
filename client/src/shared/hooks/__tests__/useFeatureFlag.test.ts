import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as posthogModule from '@/shared/lib/posthog';
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag';

const mockPostHog = {
  isFeatureEnabled: vi.fn(),
  onFeatureFlags: vi.fn(() => vi.fn()),
};

describe('useFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(posthogModule, 'getPostHog').mockReturnValue(mockPostHog as never);
  });

  it('returns true when flag is enabled', async () => {
    mockPostHog.isFeatureEnabled.mockReturnValue(true);
    const { result } = renderHook(() => useFeatureFlag('firebase-auth-enabled'));
    await act(async () => {});
    expect(result.current).toBe(true);
    expect(mockPostHog.isFeatureEnabled).toHaveBeenCalledWith('firebase-auth-enabled');
  });

  it('returns false when flag is disabled', async () => {
    mockPostHog.isFeatureEnabled.mockReturnValue(false);
    const { result } = renderHook(() => useFeatureFlag('firebase-auth-enabled'));
    await act(async () => {});
    expect(result.current).toBe(false);
  });

  it('returns false when flag is not loaded (null/undefined)', async () => {
    mockPostHog.isFeatureEnabled.mockReturnValue(undefined);
    const { result } = renderHook(() => useFeatureFlag('some-new-flag'));
    await act(async () => {});
    expect(result.current).toBe(false);
  });

  it('subscribes to flag changes via onFeatureFlags', async () => {
    mockPostHog.isFeatureEnabled.mockReturnValue(false);
    renderHook(() => useFeatureFlag('test-flag'));
    await act(async () => {});
    expect(mockPostHog.onFeatureFlags).toHaveBeenCalled();
  });
});

describe('useFeatureFlag when PostHog is not available', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(posthogModule, 'getPostHog').mockReturnValue(null);
  });

  it('returns false when getPostHog returns null', () => {
    const { result } = renderHook(() => useFeatureFlag('any-flag'));
    expect(result.current).toBe(false);
  });
});
