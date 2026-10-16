/** Pure Step-4 gates — no dependency on plans.ts (avoids circular imports). */
import { guardrailsData as g } from '../data';
import type { Conversation, Profile } from '../types/domain';
import { CLARIFY } from './journey';

const UNCOVERED = (g.uncovered?.patterns ?? []).map((p) => new RegExp(p, 'i'));

/** Required intake still open (not clarify slot, not already done). */
export function needsMoreDetails(conv: Conversation, _profile: Profile): boolean {
  if (conv.profileOnly || conv.redFlag || conv.labRefresh) return false;
  const done = conv.intakeDone ?? [];
  // Use this conversation's plan vs answers — not profile “known” flags. Seeded mid-intake (e.g. S23)
  // can show a quiz that the profile already has, and F02e still wants an early first look.
  return (conv.intakePlan ?? []).some((id) => !done.includes(id) && id !== CLARIFY);
}

/** True when free text matches simulated out-of-coverage patterns (guardrails.uncovered). */
export function matchesUncovered(text: string | undefined): boolean {
  if (!text?.trim()) return false;
  return UNCOVERED.some((re) => re.test(text));
}

export function isUncoveredConcern(conv: Conversation): boolean {
  const userBits = (conv.messages ?? [])
    .filter((m) => m.role === 'user' && m.text)
    .map((m) => m.text as string);
  const hay = [conv.openingText, conv.topic, conv.summary, ...userBits].filter(Boolean).join(' ');
  return matchesUncovered(hay);
}

export function remainingIntakeLabels(conv: Conversation, _profile: Profile, questionFn: (id: string) => { prompt: string } | undefined): string[] {
  const done = conv.intakeDone ?? [];
  return (conv.intakePlan ?? [])
    .filter((id) => !done.includes(id) && id !== CLARIFY)
    .map((id) => {
      const q = questionFn(id);
      if (!q) return id;
      const prompt = q.prompt.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();
      return prompt.length > 72 ? `${prompt.slice(0, 69)}…` : prompt;
    })
    .slice(0, 5);
}
