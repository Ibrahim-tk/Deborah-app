/**
 * Classifier — topic detection. Guardrail detection (emergency > crisis > medication >
 * outOfScope > escalation) lands in phase 4 via guardrails.ts and runs before this.
 */
import { chatIntakeData, scripts, symptomGroups } from '../data';
import type { SymptomGroupId } from '../types/domain';

const ASK_FOR_ANSWER = /\b(what do you think|tell me what you think|what's your (view|answer|take))\b/i;

/** Script whose keywords appear in the text, or null (caller falls back to 'generic'). */
export function detectScript(text: string): string | null {
  const lower = text.toLowerCase();
  for (const script of Object.values(scripts)) {
    if (script.match.some((keyword) => lower.includes(keyword))) return script.id;
  }
  return null;
}

export function asksForAnswer(text: string): boolean {
  return ASK_FOR_ANSWER.test(text);
}

/** Short follow-up reply from the script, or its fallback. */
export function followUpReply(scriptId: string | undefined, text: string): string {
  const script = scripts[scriptId ?? 'generic'] ?? scripts.generic;
  const lower = text.toLowerCase();
  return script.followUps.find((f) => f.match.some((m) => lower.includes(m)))?.reply ?? script.fallbackReply;
}

/**
 * DN-07: the symptom group a message is about, from the Symptoms sheet names (data/intake/symptoms.json)
 * and each group's keywords (chatIntake.json). The group with the most hits wins; undefined when nothing
 * matches, and the journey's general clarifiers apply.
 */
export function symptomGroupOf(text: string): SymptomGroupId | undefined {
  const lower = text.toLowerCase();
  let best: { id: SymptomGroupId; hits: number } | undefined;
  for (const g of chatIntakeData.groups) {
    const names = symptomGroups.find((x) => x.id === g.id || x.title === g.title)?.items ?? [];
    const hits = [...g.match, ...names.map((n) => n.toLowerCase())].filter((k) => lower.includes(k)).length;
    if (hits && (!best || hits > best.hits)) best = { id: g.id, hits };
  }
  return best?.id;
}
