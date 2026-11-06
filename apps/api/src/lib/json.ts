/**
 * Safe JSON parse helper that guarantees fallback on invalid JSON strings or non-string inputs.
 */
export function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value || typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
