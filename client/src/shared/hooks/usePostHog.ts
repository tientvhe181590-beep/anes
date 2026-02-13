import { useMemo } from 'react';
import { getPostHog } from '@/shared/lib/posthog';
import type { PostHog } from 'posthog-js';

/**
 * Access the PostHog instance. Returns null when PostHog is not
 * initialised (missing config, no consent, etc.). All tracking calls
 * should guard against a null return.
 */
export function usePostHog(): PostHog | null {
  return useMemo(() => getPostHog(), []);
}
