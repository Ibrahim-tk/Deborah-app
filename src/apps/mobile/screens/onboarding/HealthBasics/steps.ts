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

/**
 * Where the jacaranda should be at question i of n. The art's trunk eases in slowly, so a straight i/(n-1)
 * barely moves on the first questions. The opening questions get fixed stops instead (grass only, then the
 * trunk in three visible stages; then the canopy blooms and the flowers fall last); the last question is full bloom.
 */
const OPENING = [0, 0.15, 0.3, 0.45];
export function bloomProgress(i: number, n: number): number {
  if (n <= OPENING.length + 1) return n > 1 ? i / (n - 1) : 1;
  if (i < OPENING.length) return OPENING[i];
  const start = OPENING[OPENING.length - 1];
  const rest = n - OPENING.length; // canopy questions, the last one included
  return start + ((1 - start) * (i - OPENING.length + 1)) / rest;
}
