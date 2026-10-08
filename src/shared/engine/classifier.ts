/**
 * Classifier — topic detection. Guardrail detection (emergency > crisis > medication >
 * outOfScope > escalation) lands in phase 4 via guardrails.ts and runs before this.
 */
import { scripts } from '../data';

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
