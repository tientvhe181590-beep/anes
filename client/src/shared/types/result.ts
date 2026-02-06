/**
 * Result type for explicit error handling.
 * Use instead of try/catch for expected failures.
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return { ok: false, error: 'Division by zero' };
 *   return { ok: true, value: a / b };
 * }
 * ```
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/** Helper to create a success result */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Helper to create a failure result */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
