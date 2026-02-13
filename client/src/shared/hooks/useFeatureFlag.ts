import { useState, useEffect } from 'react';
import { getPostHog } from '@/shared/lib/posthog';

/**
 * Subscribe to a PostHog feature flag. Returns the boolean value of the flag,
 * defaulting to `false` when PostHog is not initialised or the flag hasn't
 * loaded yet.
 */
export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const ph = getPostHog();
    if (!ph) return false;
    return ph.isFeatureEnabled(flagName) ?? false;
  });

  useEffect(() => {
    const ph = getPostHog();
    if (!ph) return;

    // Check current value
    setEnabled(ph.isFeatureEnabled(flagName) ?? false);

    // Subscribe to flag changes
    const unsubscribe = ph.onFeatureFlags(() => {
      setEnabled(ph.isFeatureEnabled(flagName) ?? false);
    });

    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, [flagName]);

  return enabled;
}
