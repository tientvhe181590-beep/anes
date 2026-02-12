import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  usePasswordStrength,
  computeScore,
  calculateEntropy,
  scoreToLevel,
} from '../usePasswordStrength';

vi.mock('@/shared/utils/common-passwords', () => ({
  isBlockedPassword: (pw: string) => ['password', 'password123', '123456'].includes(pw.toLowerCase()),
}));

describe('calculateEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(calculateEntropy('')).toBe(0);
  });

  it('calculates entropy for lowercase-only', () => {
    // Pool size = 26, length = 8 → 8 * log2(26) ≈ 37.6
    const entropy = calculateEntropy('abcdefgh');
    expect(entropy).toBeCloseTo(8 * Math.log2(26), 1);
  });

  it('increases entropy with mixed character classes', () => {
    const lowerOnly = calculateEntropy('abcdefgh');
    const mixed = calculateEntropy('aBcD1234');
    expect(mixed).toBeGreaterThan(lowerOnly);
  });

  it('includes special char pool when symbols present', () => {
    // Pool: 26+26+10+33 = 95
    const entropy = calculateEntropy('aA1!');
    expect(entropy).toBeCloseTo(4 * Math.log2(95), 1);
  });
});

describe('computeScore', () => {
  it('returns 0 for empty password', () => {
    expect(computeScore('')).toBe(0);
  });

  it('returns low score for short simple passwords', () => {
    expect(computeScore('abc')).toBeLessThan(30);
  });

  it('returns higher score for longer complex passwords', () => {
    const short = computeScore('abc');
    const long = computeScore('aB3!xK9#mP2z');
    expect(long).toBeGreaterThan(short);
  });

  it('penalizes repeated characters', () => {
    const varied = computeScore('abcdefghijkl');
    const repeated = computeScore('aaaaaaaaaaaa');
    expect(repeated).toBeLessThan(varied);
  });

  it('penalizes sequential characters', () => {
    const varied = computeScore('axmqplzwknvb');
    const sequential = computeScore('abcdefghijkl');
    expect(sequential).toBeLessThan(varied);
  });

  it('never exceeds 100', () => {
    const score = computeScore('aB3!xK9#mP2z$wQ7&rT5^uY8*');
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('scoreToLevel', () => {
  it('maps scores to correct levels', () => {
    expect(scoreToLevel(0)).toBe('weak');
    expect(scoreToLevel(15)).toBe('weak');
    expect(scoreToLevel(29)).toBe('weak');
    expect(scoreToLevel(30)).toBe('fair');
    expect(scoreToLevel(54)).toBe('fair');
    expect(scoreToLevel(55)).toBe('good');
    expect(scoreToLevel(79)).toBe('good');
    expect(scoreToLevel(80)).toBe('strong');
    expect(scoreToLevel(100)).toBe('strong');
  });
});

describe('usePasswordStrength', () => {
  it('returns empty state for empty password', () => {
    const { result } = renderHook(() => usePasswordStrength(''));
    expect(result.current.score).toBe(0);
    expect(result.current.level).toBe('weak');
    expect(result.current.feedback).toBe('');
    expect(result.current.isBlocked).toBe(false);
    expect(result.current.isBreached).toBe(false);
  });

  it('detects blocked (common) passwords', () => {
    const { result } = renderHook(() => usePasswordStrength('password'));
    expect(result.current.isBlocked).toBe(true);
    expect(result.current.level).toBe('weak');
    expect(result.current.score).toBeLessThanOrEqual(15);
    expect(result.current.feedback).toContain('commonly used');
  });

  it('caps score to weak when breached', () => {
    const { result } = renderHook(() =>
      usePasswordStrength('aB3!xK9#mP2z', true),
    );
    expect(result.current.isBreached).toBe(true);
    expect(result.current.level).toBe('weak');
    expect(result.current.score).toBeLessThanOrEqual(15);
    expect(result.current.feedback).toContain('data breach');
  });

  it('rates a strong password correctly', () => {
    const { result } = renderHook(() =>
      usePasswordStrength('xK9#mP2!qR4z&wT7'),
    );
    expect(result.current.level).toBe('strong');
    expect(result.current.score).toBeGreaterThanOrEqual(80);
    expect(result.current.feedback).toContain('Excellent');
  });

  it('rates a decent password as fair or good', () => {
    const { result } = renderHook(() => usePasswordStrength('helloworld12'));
    expect(['fair', 'good']).toContain(result.current.level);
  });
});
