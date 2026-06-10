// The festival map is always visible during local development so it can be
// built and tested, and otherwise follows the per-event server flag in prod —
// so a half-built or empty map is never exposed to attendees.
export function isMapVisible(serverEnabled: boolean | undefined): boolean {
  return import.meta.env.DEV || Boolean(serverEnabled);
}
