/** Replace {key} tokens; unknown tokens are left as-is so gaps are visible in review. */
export function interpolate(template: string, values: Record<string, string | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m);
}
