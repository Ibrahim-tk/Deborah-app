/** Evaluates `showIf` rules from data/intake/healthBasics.json against the answers so far. */
import type { ShowIf } from '../types/content';

export function shows(rule: ShowIf | undefined, answers: Record<string, string | undefined>): boolean {
  if (!rule) return true;
  return Object.entries(rule).every(([key, cond]) => {
    const v = answers[key];
    if (cond.in && !(v !== undefined && cond.in.includes(v))) return false;
    if (cond.notIn && v !== undefined && cond.notIn.includes(v)) return false;
    return true;
  });
}
