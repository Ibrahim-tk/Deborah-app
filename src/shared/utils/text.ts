/** Replace {key} tokens; unknown tokens are left as-is so gaps are visible in review. */
export function interpolate(template: string, values: Record<string, string | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m);
}

/** Proper-case a person's name: first letter of each word upper-case, the rest kept as typed ("kashif" → "Kashif"). */
export function properName(name: string): string {
  return name.replace(/(^|[\s'’-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
