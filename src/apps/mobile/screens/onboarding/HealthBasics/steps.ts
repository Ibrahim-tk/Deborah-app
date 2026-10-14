/**
 * The health basics come from data/intake/healthBasics.json, in order. Each question and each suggestion
 * can carry a `showIf` rule (e.g. sex "male" hides the hormonal and HRT questions); edit the JSON, not code.
 * Choice steps advance on tap; text steps have a one-tap "None" answer.
 */
import { healthBasicsData } from '@shared/data';
import { shows } from '@shared/engine';
import type { HealthBasicsStep } from '@shared/types/content';

export type Step = HealthBasicsStep;
export type Answers = Partial<Record<string, string>>;

export const STEPS: Step[] = healthBasicsData.steps;

/** Questions to ask, given the answers so far. */
export const visibleSteps = (a: Answers) => STEPS.filter((s) => shows(s.showIf, a));
/** Suggestions to offer on a text step, given the answers so far. */
export const visibleSuggestions = (s: Step, a: Answers) => (s.suggestions ?? []).filter((x) => shows(x.showIf, a)).map((x) => x.label);

/** Splits a typed list ("a, b") into names; the "None" answers are stored as an empty list. */
export function list(value: string | undefined, none?: string): string[] {
  if (!value || value === none) return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

/** Authored growth stops: a visible root on entry, branches first, then a continuous bloom. */
const OPENING = [0.08, 0.19, 0.3, 0.4];
export function bloomProgress(i: number, n: number): number {
  if (n <= 1) return 1;
  const index = Math.max(0, Math.min(n - 1, i));
  if (n <= OPENING.length + 1) return OPENING[0] + (1 - OPENING[0]) * index / (n - 1);
  if (index < OPENING.length) return OPENING[index];
  const start = OPENING[OPENING.length - 1];
  return start + (1 - start) * (index - OPENING.length + 1) / (n - OPENING.length);
}
