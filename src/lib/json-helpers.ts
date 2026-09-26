/**
 * Shared JSON helper — parses values that might be stored as strings
 * (SQLite TEXT columns) or already-parsed objects (PostgreSQL Json columns).
 *
 * Used by admin API routes that read from CompanySettings (which stores
 * everything as a JSON blob).
 */

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}
