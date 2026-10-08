/** Join class names, skipping falsy values. Replaces the `classnames` dependency (docs/09-styling.md §3). */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
