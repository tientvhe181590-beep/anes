import { getPostHog } from '@/shared/lib/posthog';
import type { UserProfile } from '@/app/store';

// ────────────────────────────────────────────────────────────
// Safe capture helper — no-ops when PostHog is unavailable
// ────────────────────────────────────────────────────────────

function capture(event: string, properties?: Record<string, unknown>): void {
  const ph = getPostHog();
  if (!ph) return;
  ph.capture(event, properties);
}

// ────────────────────────────────────────────────────────────
// Identity
// ────────────────────────────────────────────────────────────

export function identifyUser(user: UserProfile): void {
  const ph = getPostHog();
  if (!ph) return;
  ph.identify(String(user.id), {
    email: user.email,
    onboardingComplete: user.onboardingComplete,
  });
  ph.reloadFeatureFlags();
}

export function resetIdentity(): void {
  const ph = getPostHog();
  if (!ph) return;
  ph.reset();
}

// ────────────────────────────────────────────────────────────
// Auth events
// ────────────────────────────────────────────────────────────

export function trackLogin(method: 'firebase' | 'google'): void {
  capture('auth_login', { method });
}

export function trackRegister(method: 'email' | 'google'): void {
  capture('auth_register', { method });
}

export function trackLogout(): void {
  capture('auth_logout');
}

export function trackAuthError(errorType: string, method: string): void {
  capture('auth_error', { error_type: errorType, method });
}

// ────────────────────────────────────────────────────────────
// Onboarding events
// ────────────────────────────────────────────────────────────

export function trackOnboardingStarted(): void {
  capture('onboarding_started');
}

export function trackOnboardingStepCompleted(step: number, stepName: string): void {
  capture('onboarding_step_completed', { step, step_name: stepName });
}

export function trackOnboardingCompleted(durationSeconds: number): void {
  capture('onboarding_completed', { duration_seconds: durationSeconds });
}

// ────────────────────────────────────────────────────────────
// Feature events
// ────────────────────────────────────────────────────────────

export function trackWorkoutStarted(programId: string, templateId: string): void {
  capture('workout_started', { program_id: programId, template_id: templateId });
}

export function trackWorkoutCompleted(programId: string, durationSeconds: number): void {
  capture('workout_completed', { program_id: programId, duration_seconds: durationSeconds });
}

export function trackRecipeViewed(recipeId: string): void {
  capture('recipe_viewed', { recipe_id: recipeId });
}

export function trackAiChatSent(messageLength: number): void {
  capture('ai_chat_sent', { message_length: messageLength });
}

// ────────────────────────────────────────────────────────────
// Page tracking
// ────────────────────────────────────────────────────────────

export function trackPageView(path: string, referrer: string): void {
  capture('page_viewed', { path, referrer });
}
