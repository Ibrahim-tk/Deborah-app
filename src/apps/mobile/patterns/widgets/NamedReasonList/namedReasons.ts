export interface NamedReason {
  name: string;
  reason: string;
}

/** Serialize rows for answers store (drops blank names). Empty list → "[]" (not "") so clears stick. */
export function encodeNamedReasons(entries: NamedReason[]): string {
  const kept = entries.filter((e) => e.name.trim()).map((e) => ({
    name: e.name.trim(),
    reason: e.reason.trim(),
  }));
  return JSON.stringify(kept);
}

/** Parse answers value; falls back to legacy comma names. */
export function decodeNamedReasons(value: string | undefined, none?: string): NamedReason[] {
  if (!value || value === none) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((x) => ({
          name: typeof (x as { name?: unknown })?.name === 'string' ? (x as { name: string }).name : '',
          reason: typeof (x as { reason?: unknown })?.reason === 'string' ? (x as { reason: string }).reason : '',
        }))
        .filter((x) => x.name.trim());
    }
  } catch {
    /* legacy comma list */
  }
  return value
    .split(',')
    .map((n) => ({ name: n.trim(), reason: '' }))
    .filter((x) => x.name);
}

export function namedReasonsComplete(value: string | undefined, none?: string): boolean {
  if (value === none) return true;
  if (!value?.trim()) return false;
  try {
    const parsed = JSON.parse(value) as NamedReason[];
    return Array.isArray(parsed) && parsed.some((e) => e.name?.trim());
  } catch {
    return Boolean(value.trim());
  }
}
