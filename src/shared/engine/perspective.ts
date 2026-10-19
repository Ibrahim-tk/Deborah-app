/**
 * Family chat perspective: Deborah's copy is written to the owner ("you"). When the chat is about another
 * profile, every Deborah string is rewritten to third person with that member's pronouns, so the whole
 * conversation is about them ("Why is Emma waking at 3am?", "her sleep", "she feels…").
 *
 * Heuristic rewrite of placeholder copy (rules below), applied once per plan in the bridge runner.
 * OPEN: Deborah to approve third-person wording; swap to authored `…Other` copy where a line reads awkwardly.
 */
import type { EnginePlan, Step } from '../types/engine';

export interface PronounForms {
  they: string;
  them: string;
  their: string;
  theirs: string;
  themselves: string;
  /** Singular verb agreement (she is / they are). */
  singular: boolean;
}

const FORMS: Record<'she' | 'he' | 'they', PronounForms> = {
  she: { they: 'she', them: 'her', their: 'her', theirs: 'hers', themselves: 'herself', singular: true },
  he: { they: 'he', them: 'him', their: 'his', theirs: 'his', themselves: 'himself', singular: true },
  they: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', themselves: 'themselves', singular: false },
};

/** Stored pronouns ("she/her", "he-him", "she/they"…) → forms. Anything else → they/them. */
export const pronounForms = (pronouns = ''): PronounForms => {
  const p = pronouns.toLowerCase();
  return p.startsWith('she') ? FORMS.she : p.startsWith('he') ? FORMS.he : FORMS.they;
};

/** Words after which "you" is an object (→ her/him/them) rather than a subject. */
const OBJECT_AFTER = new Set(
  'to for with about at on from by of into than help tell give let ask show see thank keep make get send hear remind support protect guide walk reach meet join wake bother affect leave call'.split(' '),
);
/** Present-tense verbs that need an -s after she/he ("you feel" → "she feels"). */
const VERBS = new Set(
  'feel wake sleep notice take want need get eat think know see find start keep seem experience struggle mention describe use like love hate feel deal live work drink stay wonder tend hope remember mean'.split(' '),
);
const IRREGULAR: Record<string, string> = { have: 'has', do: 'does', go: 'goes', try: 'tries', say: 'says', are: 'is', were: 'was', "aren't": "isn't", "don't": "doesn't", "weren't": "wasn't" };

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
const like = (src: string, word: string) => (src[0] === src[0].toUpperCase() ? cap(word) : word);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Rewrites one string from "you" (the owner) to third person about `name`. */
export function toThirdPerson(text: string, name: string, f: PronounForms): string {
  if (!text || !/\byou/i.test(text)) return text;
  const n = escape(name);
  const agree = (verb: string) => {
    if (!f.singular) return verb;
    const low = verb.toLowerCase();
    if (IRREGULAR[low]) return like(verb, IRREGULAR[low]);
    if (VERBS.has(low)) return verb + 's';
    return verb;
  };
  let s = text
    // Deborah still thanks the person she's talking to.
    .replace(/\bthank you\b/gi, (m) => m.replace(/you/i, '\u0000'))
    // Vocative name: "Thank you, Emma." → "Thank you."; "Emma, you're…" → "Emma's…" / "Emma is…".
    .replace(new RegExp(`, ${n}([.!?])`, 'g'), '$1')
    .replace(new RegExp(`\\b${n}, you're\\b`, 'g'), `${name} is`)
    .replace(new RegExp(`\\b${n}, you\\b`, 'g'), name)
    // Contractions.
    .replace(/\byou're\b/gi, (m) => like(m, f.singular ? `${f.they}'s` : `${f.they}'re`))
    .replace(/\byou've\b/gi, (m) => like(m, f.singular ? `${f.they}'s` : `${f.they}'ve`))
    .replace(/\byou'll\b/gi, (m) => like(m, `${f.they}'ll`))
    .replace(/\byou'd\b/gi, (m) => like(m, `${f.they}'d`))
    // Questions: "are you" → "is she", "do you" → "does she".
    .replace(/\b(are|were|have|do|did|can|could|would|will|should|aren't|don't)\s+you\b/gi, (_m, aux: string) =>
      `${agree(aux)} ${f.they}`,
    )
    .replace(/\byourself\b/gi, (m) => like(m, f.themselves))
    .replace(/\byours\b/gi, (m) => like(m, f.theirs))
    .replace(/\byour\b/gi, (m) => like(m, f.their))
    // Remaining "you": object after a verb/preposition, otherwise subject (+ verb agreement).
    .replace(/(\b[\w']+\s+)?\byou\b(\s+[\w']+)?/gi, (m, before = '', after = '') => {
      const prev = before.trim().toLowerCase();
      const you = m.slice(before.length, before.length + 3);
      if (prev && OBJECT_AFTER.has(prev)) return `${before}${like(you, f.them)}${after}`;
      const verb = after.trim();
      return `${before}${like(you, f.they)}${verb ? after.replace(verb, agree(verb)) : ''}`;
    });
  s = s.replace(/\u0000/g, 'you');
  return s;
}

/** The owner's own suggested questions ("Why am I so tired?") → about the member ("Why is Emma so tired?"). */
export function firstToThirdPerson(text: string, name: string, f: PronounForms): string {
  const agree = (verb: string) => (f.singular && VERBS.has(verb.toLowerCase()) ? verb + 's' : verb);
  let first = true; // first "I" becomes the name, later ones the pronoun
  const who = () => (first ? ((first = false), name) : f.they);
  return text
    .replace(/\bam I\b/g, () => `is ${who()}`)
    .replace(/\bI'm\b/g, () => `${who()} is`)
    .replace(/\bI've\b/g, () => `${who()} has`)
    .replace(/\bI can't\b/g, () => `${who()} can't`)
    .replace(/\b(do|did|should|can) I\b/gi, (_m, aux: string) => `${aux.toLowerCase() === 'do' && f.singular ? 'does' : aux} ${who()}`)
    .replace(/\bI (\w+)/g, (_m, verb: string) => `${who()} ${agree(verb)}`)
    .replace(/\bmy\b/gi, (m) => like(m, f.their))
    .replace(/\bme\b/g, f.them)
    .replace(/^(\w)/, (c) => c.toUpperCase());
}

/** Message fields that carry Deborah's copy; everything else (ids, kinds, values) is left alone. */
const COPY_KEYS = new Set(['text', 'title', 'body', 'bullets', 'prompt', 'label', 'question', 'suggestions', 'line', 'placeholder', 'description', 'helper', 'note']);

type Rewrite = { you: (s: string) => string; mine: (s: string) => string };

function walk(value: unknown, r: Rewrite, key?: string): unknown {
  if (typeof value === 'string') return key === 'suggestions' ? r.mine(value) : key && COPY_KEYS.has(key) ? r.you(value) : value;
  if (Array.isArray(value)) return value.map((v) => walk(v, r, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, r, k)]));
  return value;
}

/** Rewrites every Deborah-facing string in a plan to third person (user messages stay as typed). */
export function forFamilyMember(plan: EnginePlan, name: string, pronouns?: string): EnginePlan {
  const f = pronounForms(pronouns);
  const r: Rewrite = { you: (s) => toThirdPerson(s, name, f), mine: (s) => firstToThirdPerson(s, name, f) };
  return plan.map((step): Step => {
    if (step.type === 'stream') return { ...step, text: r.you(step.text) };
    if (step.type === 'message' && step.message.role !== 'user') return { ...step, message: walk(step.message, r) as typeof step.message };
    if (step.type === 'patch') return { ...step, patch: walk(step.patch, r) as typeof step.patch };
    return step;
  });
}
