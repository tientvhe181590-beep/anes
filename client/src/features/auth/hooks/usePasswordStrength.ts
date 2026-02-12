import { useMemo } from 'react';
import { isBlockedPassword } from '@/shared/utils/common-passwords';

export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  /** 0-100 normalized score */
  score: number;
  /** Categorical strength level */
  level: StrengthLevel;
  /** Human-readable feedback */
  feedback: string;
  /** Whether the password is on the common-passwords blocklist */
  isBlocked: boolean;
  /** Whether a breach was detected (set externally) */
  isBreached: boolean;
}

/**
 * Calculate password entropy based on character pool size and length.
 * Returns bits of entropy.
 */
function calculateEntropy(password: string): number {
  if (password.length === 0) return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) return 0;
  return password.length * Math.log2(poolSize);
}

/**
 * Penalize repeated characters (e.g., "aaaaaa") and sequential runs.
 * Returns a multiplier between 0.3 and 1.0.
 */
function calculatePenalty(password: string): number {
  if (password.length < 2) return 1;

  let repeats = 0;
  let sequences = 0;

  for (let i = 1; i < password.length; i++) {
    // Repeated chars
    if (password[i] === password[i - 1]) {
      repeats++;
    }
    // Sequential chars (abc, 123, etc.)
    if (password.charCodeAt(i) - password.charCodeAt(i - 1) === 1) {
      sequences++;
    }
    // Reverse sequential (cba, 321)
    if (password.charCodeAt(i) - password.charCodeAt(i - 1) === -1) {
      sequences++;
    }
  }

  const totalLen = password.length - 1;
  const repeatRatio = repeats / totalLen;
  const seqRatio = sequences / totalLen;

  // Heavy penalty for highly repetitive or sequential passwords
  let penalty = 1 - repeatRatio * 0.5 - seqRatio * 0.3;
  return Math.max(0.3, Math.min(1, penalty));
}

/**
 * Convert entropy + penalties into a 0-100 score.
 */
function computeScore(password: string): number {
  if (password.length === 0) return 0;

  const entropy = calculateEntropy(password);
  const penalty = calculatePenalty(password);
  const adjustedEntropy = entropy * penalty;

  // Map entropy to 0-100 score
  // < 25 bits → Weak, 25-50 → Fair, 50-75 → Good, 75+ → Strong
  const score = Math.min(100, Math.round((adjustedEntropy / 80) * 100));
  return Math.max(0, score);
}

function scoreToLevel(score: number): StrengthLevel {
  if (score < 30) return 'weak';
  if (score < 55) return 'fair';
  if (score < 80) return 'good';
  return 'strong';
}

function levelToFeedback(level: StrengthLevel, isBlocked: boolean, isBreached: boolean): string {
  if (isBlocked) return 'This is a commonly used password. Choose something unique.';
  if (isBreached) return 'This password has appeared in a data breach. Choose a different one.';

  switch (level) {
    case 'weak':
      return 'Too weak — try making it longer and more varied.';
    case 'fair':
      return 'Getting there — add more length or character variety.';
    case 'good':
      return 'Good password strength.';
    case 'strong':
      return 'Excellent password strength!';
  }
}

/**
 * React hook that computes password strength in real-time.
 *
 * @param password - The password string to evaluate
 * @param isBreached - Whether the password was found in HIBP (external async check)
 */
export function usePasswordStrength(
  password: string,
  isBreached = false,
): PasswordStrengthResult {
  return useMemo(() => {
    if (password.length === 0) {
      return {
        score: 0,
        level: 'weak' as StrengthLevel,
        feedback: '',
        isBlocked: false,
        isBreached: false,
      };
    }

    const isBlocked = isBlockedPassword(password);

    // Cap at Weak if blocked or breached
    let score = computeScore(password);
    if (isBlocked || isBreached) {
      score = Math.min(score, 15); // Cap well within "weak" range
    }

    const level = scoreToLevel(score);
    const feedback = levelToFeedback(level, isBlocked, isBreached);

    return { score, level, feedback, isBlocked, isBreached };
  }, [password, isBreached]);
}

// Export pure functions for testing
export { computeScore, calculateEntropy, scoreToLevel };
