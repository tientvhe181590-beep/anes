/**
 * Check if a password has been seen in a data breach using the
 * Have I Been Pwned (HIBP) Passwords API with k-anonymity.
 *
 * The password is SHA-1 hashed locally. Only the first 5 hex characters
 * are sent to the API, protecting the full hash from disclosure.
 *
 * Soft-fails on any network/API error — returns { breached: false, error: true }.
 */

export interface BreachCheckResult {
  /** Whether the password was found in a breach */
  breached: boolean;
  /** Approximate number of times the password appeared in breaches */
  count: number;
  /** Whether an error occurred during the check */
  error: boolean;
}

/**
 * Hash a password using SHA-1 and return the uppercase hex digest.
 * Uses the Web Crypto API (available in browsers and Service Workers).
 */
async function sha1Hex(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Check if a password has been exposed in a data breach.
 *
 * Uses the HIBP k-anonymity model:
 * 1. SHA-1 hash the password
 * 2. Send the first 5 chars (prefix) to the API
 * 3. The API returns all suffixes matching that prefix
 * 4. Check if our full suffix appears in the results
 *
 * @param password - The plaintext password to check
 * @returns BreachCheckResult
 */
export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    const hash = await sha1Hex(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Request padding to prevent response-length analysis
      },
    });

    if (!response.ok) {
      return { breached: false, count: 0, error: true };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix?.trim() === suffix) {
        const count = parseInt(countStr?.trim() ?? '0', 10);
        return { breached: true, count, error: false };
      }
    }

    return { breached: false, count: 0, error: false };
  } catch {
    // Soft-fail — don't block registration if HIBP is unreachable
    return { breached: false, count: 0, error: true };
  }
}
