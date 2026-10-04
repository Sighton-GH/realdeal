/**
 * Returns the YYYY-MM-DD date string of the Monday of the week containing the given date.
 * Uses UTC throughout, like the rest of the app (shared/seed/constants DATA_END, mondays()),
 * so the result does not depend on the machine's time zone.
 */
export function mondayOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().slice(0, 10);
}
