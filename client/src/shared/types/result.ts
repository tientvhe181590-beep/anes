/**
 * Result type for explicit error handling (replaces try/catch).
 *
 * @example
 * const result = ok(42);
 * if (result.ok) { console.log(result.value); }
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/** Create a success result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Create a failure result. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Unwrap a Result — returns value on Ok, throws on Err. */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error;
}

/** Map the Ok value if present. */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) return ok(fn(result.value));
  return result;
}

/**
 * Wrap a promise into a Result — never throws.
 *
 * @example
 * const result = await tryCatch(fetch("/api/users"));
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    return ok(await promise);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
