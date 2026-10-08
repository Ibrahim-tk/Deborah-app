/**
 * Guardrails (docs/07-ai-simulation.md §3, docs/ux/F03-safety.md). Keyword/regex detection with
 * precedence emergency > crisis > medication (additive) > out-of-scope > escalation > topic.
 * Safety replies are never counted, never gated and never carry a product card.
 */
import { guardrailsData as g } from '../data';
import type { EngineContext } from '../types/engine';

export type Replacing = 'emergency' | 'crisis' | 'outOfScope';

export interface GuardrailResult {
  /** Replaces the normal flow for this message. */
  replace?: Replacing;
  /** Medication patterns matched and not yet answered in this conversation (additive card). */
  medication: string[];
  /** Escalation card follows the normal reply. */
  escalation: boolean;
}

// Patterns are case-insensitive regex fragments; anchor at a word start so "mri" ≠ "primrose".
const compile = (patterns: string[]) => patterns.map((p) => ({ p, re: new RegExp(`\\b(?:${p})`, 'i') }));
const RULES = {
  emergency: compile(g.emergency.patterns),
  crisis: compile(g.crisis.patterns),
  medication: compile(g.medication.patterns),
  outOfScope: compile(g.outOfScope.patterns),
  escalation: compile(g.escalation.triggers.phrases),
};
const any = (rules: { re: RegExp }[], text: string) => rules.some((r) => r.re.test(text));

// Generic medication words share one key; only a new medication NAME re-shows the card.
const GENERIC_MED = /^(medication|meds|prescri|dose|dosage|stop taking|start taking)$/;
const GENERIC_KEY = 'any-medication';

/** Medication keys to warn about: shown once per conversation unless a new medication name appears. */
function newMedicationMatches(text: string, warned: string[]): string[] {
  const keys = new Set(RULES.medication.filter((r) => r.re.test(text)).map((r) => (GENERIC_MED.test(r.p) ? GENERIC_KEY : r.p)));
  const names = [...keys].filter((k) => k !== GENERIC_KEY && !warned.includes(k));
  if (names.length) return names;
  return keys.has(GENERIC_KEY) && warned.length === 0 ? [GENERIC_KEY] : [];
}

export function classify(text: string, ctx: EngineContext): GuardrailResult {
  if (any(RULES.emergency, text)) return { replace: 'emergency', medication: [], escalation: false };
  if (any(RULES.crisis, text)) return { replace: 'crisis', medication: [], escalation: false };
  const medication = newMedicationMatches(text, ctx.conversation.medsWarned ?? []);
  if (any(RULES.outOfScope, text)) return { replace: 'outOfScope', medication, escalation: false };
  const offered = ctx.conversation.messages.some((m) => m.kind === 'escalation');
  const escalation = !offered && (any(RULES.escalation, text) || ctx.sameTopicCount >= g.escalation.triggers.unresolvedConsultations);
  return { medication, escalation };
}
