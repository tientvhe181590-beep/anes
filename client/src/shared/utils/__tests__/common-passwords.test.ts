import { describe, expect, it } from 'vitest';
import { isBlockedPassword } from '../common-passwords';

describe('isBlockedPassword', () => {
  it('blocks known common passwords', () => {
    expect(isBlockedPassword('password')).toBe(true);
    expect(isBlockedPassword('123456')).toBe(true);
    expect(isBlockedPassword('qwerty')).toBe(true);
    expect(isBlockedPassword('letmein')).toBe(true);
    expect(isBlockedPassword('iloveyou')).toBe(true);
  });

  it('blocks case-insensitively', () => {
    expect(isBlockedPassword('PASSWORD')).toBe(true);
    expect(isBlockedPassword('Password')).toBe(true);
    expect(isBlockedPassword('QWERTY')).toBe(true);
  });

  it('allows non-common passwords', () => {
    expect(isBlockedPassword('xK9#mP2!qR4z')).toBe(false);
    expect(isBlockedPassword('myUniqueSecretPhrase2024!')).toBe(false);
    expect(isBlockedPassword('')).toBe(false);
  });
});
