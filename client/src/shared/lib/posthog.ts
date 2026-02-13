import posthog from 'posthog-js';
import type { PostHog } from 'posthog-js';

const CONSENT_KEY = 'anes.analytics_consent';

let posthogInstance: PostHog | null = null;
let initAttempted = false;

/**
 * Check whether the user has granted analytics consent.
 * Returns false if consent is denied or not yet provided.
 */
export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

/**
 * Check whether PostHog environment variables are configured.
 */
export function isPostHogConfigured(): boolean {
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY as string | undefined;
  return Boolean(apiKey);
}

/**
 * Lazily initialize PostHog. Returns the instance if configured and consent
 * is granted, otherwise returns null. Subsequent calls return the cached
 * instance.
 */
export function initPostHog(): PostHog | null {
  if (posthogInstance) return posthogInstance;
  if (initAttempted) return null;
  initAttempted = true;

  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY as string | undefined;
  const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com';

  if (!apiKey) {
    return null;
  }

  if (!hasAnalyticsConsent()) {
    return null;
  }

  posthog.init(apiKey, {
    api_host: host,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: 'identified_only',
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });

  posthogInstance = posthog;
  return posthogInstance;
}

/**
 * Get the current PostHog instance, or null if not initialized.
 */
export function getPostHog(): PostHog | null {
  return posthogInstance;
}

/**
 * Reset the module state. Useful for testing.
 */
export function _resetPostHog(): void {
  posthogInstance = null;
  initAttempted = false;
}
