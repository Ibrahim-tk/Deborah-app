/**
 * Evaluates `showIf` rules (data/intake/healthBasics.json, data/conversation/chatIntake.json) against the
 * answers so far. A value can be one answer, a list of answers, or a number (age).
 */
import type { ShowIf } from '../types/content';

export type ShowIfValue = string | number | string[] | undefined;

const isUnknown = (v: ShowIfValue) => v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

export function shows(rule: ShowIf | undefined, answers: Record<string, ShowIfValue>): boolean {
  if (!rule) return true;
  return Object.entries(rule).every(([key, cond]) => {
    const v = answers[key];
    if (cond.unknown !== undefined && cond.unknown !== isUnknown(v)) return false;
    const one = typeof v === 'string' ? v : typeof v === 'number' ? String(v) : undefined;
    if (cond.in && !(one !== undefined && cond.in.includes(one))) return false;
    if (cond.notIn && one !== undefined && cond.notIn.includes(one)) return false;
    const many = Array.isArray(v) ? v : one !== undefined ? [one] : [];
    if (cond.has && !cond.has.some((x) => many.includes(x))) return false;
    if (cond.lacks && cond.lacks.some((x) => many.includes(x))) return false;
    if (cond.min !== undefined && !(typeof v === 'number' && v >= cond.min)) return false;
    if (cond.max !== undefined && !(typeof v === 'number' && v <= cond.max)) return false;
    return true;
  });
}
