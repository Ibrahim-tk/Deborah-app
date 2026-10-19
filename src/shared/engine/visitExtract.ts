/**
 * Mock extraction for a logged provider visit (docs/ux/F09c-log-visit.md › What is recorded).
 * Deterministic keyword rules over what the client typed or said — stands in for the LLM call.
 * It only records what she reports; it never interprets a diagnosis or a dose.
 */
import { medicinesData, visitSpecialties } from '../data';
import type { VisitMedChange, VisitOutcome, VisitTestStatus } from '../types/domain';

export type VisitConfidence = Record<string, number>;

const TESTS = [
  'free T3', 'free T4', 'TSH', 'thyroid panel', 'thyroid antibodies', 'cortisol', 'DHEA-S', 'DHEA', 'FSH', 'LH', 'estradiol',
  'progesterone', 'testosterone', 'vitamin D', 'ferritin', 'iron panel', 'CBC', 'A1c', 'lipid panel', 'cholesterol',
  'metabolic panel', 'ultrasound', 'mammogram', 'bone density', 'EKG', 'ECG', 'echocardiogram', 'blood work',
];
const SUPPLEMENTS = ['Genesis Gold', 'Sacred Seven', 'magnesium glycinate', 'magnesium', 'vitamin D3', 'vitamin D', 'fish oil', 'omega-3', 'progesterone cream', 'estrogen patch', 'HRT'];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasWord = (text: string, w: string) => new RegExp(`(^|[^\\w])${esc(w)}([^\\w]|$)`, 'i').test(text);
const sentences = (text: string) => text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
/** Clauses inside a sentence: "she ordered FSH, and they drew TSH" → two clauses. */
const clauses = (parts: string[]) => parts.flatMap((s) => s.split(/[,;]\s*|\s+and\s+(?=(?:they|she|he|said|also|then|we|i|told|asked|wants?|gave|put|prescribed|ordered|drew|referred|started|stopped|switched|increased|decreased|kept)\b)/i)).map((c) => c.trim()).filter(Boolean);
const tidy = (s: string) => s.replace(/\s+/g, ' ').replace(/^(and|but|so|then)\s+/i, '').trim();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function specialty(text: string, out: VisitOutcome, conf: VisitConfidence) {
  const hit = visitSpecialties.find((o) => o.keywords.some((k) => hasWord(text, k)));
  if (!hit) return;
  // "my doctor" alone is a guess.
  const vague = hit.id === 'primary-care' && !/primary care|pcp|family doctor|\bgp\b|internist/i.test(text);
  out.provider.specialty = hit.id;
  conf['provider.specialty'] = vague ? 0.5 : 0.9;
}

function providerName(text: string, out: VisitOutcome, conf: VisitConfidence) {
  const m = /\b(?:Dr\.?|Doctor)\s+([A-Z][a-z'-]+)/.exec(text);
  if (m) [out.provider.name, conf['provider.name']] = [`Dr. ${m[1]}`, 0.9];
}

function testStatus(sentence: string): VisitTestStatus {
  if (/results?|came back/i.test(sentence)) return 'results';
  if (/\b(drew|drawn|took blood|already (did|had)|done today|had it done)\b/i.test(sentence)) return 'done';
  return 'ordered';
}

function tests(parts: string[], out: VisitOutcome, conf: VisitConfidence) {
  for (const s of parts) {
    if (!/\b(order|test|check|labs?|blood|draw|drew|want|panel|scan|ultrasound|mammogram|referr)/i.test(s)) continue;
    // Longest names first so "free T3" wins over "T3"-like fragments.
    const found = [...TESTS].sort((a, b) => b.length - a.length).filter((t) => hasWord(s, t));
    for (const name of found) {
      if (out.tests.some((t) => t.name.toLowerCase().includes(name.toLowerCase()))) continue;
      out.tests.push({ name, status: testStatus(s) });
    }
    if (found.length) conf.tests = 0.85;
  }
}

const CHANGE_RULES: [RegExp, VisitMedChange][] = [
  [/\b(stop(ped)?|discontinu\w*|come off|taken off|quit)\b/i, 'stopped'],
  [/\b(increas\w*|decreas\w*|rais\w*|lower\w*|doubl\w*|halv\w*|chang\w* (the )?dose|adjust\w*)\b/i, 'dose'],
  [/\b(start\w*|prescrib\w*|put me on|add\w*|begin|try)\b/i, 'started'],
  [/\b(keep|continu\w*|stay on|carry on)\b/i, 'continue'],
];
const isMedOrTest = (c: string) => CHANGE_RULES.some(([re]) => re.test(c)) || TESTS.some((t) => hasWord(c, t));

function meds(parts: string[], out: VisitOutcome, conf: VisitConfidence) {
  const lexicon = [...medicinesData, ...SUPPLEMENTS].sort((a, b) => b.length - a.length);
  for (const s of parts) {
    const rule = CHANGE_RULES.find(([re]) => re.test(s));
    if (!rule) continue;
    const known = lexicon.filter((n) => hasWord(s, n)).filter((n, i, all) => !all.slice(0, i).some((x) => x.toLowerCase().includes(n.toLowerCase())));
    let names = known;
    let c = 0.9;
    if (!names.length) {
      // Unknown name right after the verb: lower confidence so the review asks "Check this".
      const m = /\b(?:start(?:ed)? me on|put me on|prescribed|started|stop(?:ped)?|increased|decreased)\s+(?:on\s+|taking\s+|my\s+|the\s+)?([A-Za-z][\w-]{2,}(?:\s[A-Z0-9][\w-]*)?)/i.exec(s);
      if (!m || /^(it|that|this|them|some|a|an|me)$/i.test(m[1])) continue;
      names = [cap(m[1])];
      c = 0.6;
    }
    for (const name of names) {
      if (out.medChanges.some((x) => x.name.toLowerCase() === name.toLowerCase())) continue;
      out.medChanges.push({ name, change: rule[1] });
    }
    conf.medChanges = Math.min(conf.medChanges ?? 1, c);
  }
}

function takeaway(parts: string[], out: VisitOutcome, conf: VisitConfidence) {
  const said = clauses(parts).filter((s) => !isMedOrTest(s) && /\b(said|told me|thinks?|thought|explained|diagnos\w*|nothing wrong|normal|because of|due to|probably|likely)\b/i.test(s) && !/didn'?t|forgot/i.test(s));
  if (said.length && !out.takeaway.said) [out.takeaway.said, conf['takeaway.said']] = [said.map((c) => cap(tidy(c)).replace(/([^.!?])$/, '$1.')).join(' '), 0.8];
  const open = parts.filter((s) => /\b(didn'?t (get to|have time|ask|talk|address|discuss)|forgot to ask|ran out of time|still (don'?t know|wondering))\b/i.test(s));
  if (open.length && !out.takeaway.unanswered) [out.takeaway.unanswered, conf['takeaway.unanswered']] = [open.map(tidy).join(' '), 0.8];
}

function nextSteps(parts: string[], out: VisitOutcome, conf: VisitConfidence) {
  for (const s of parts) {
    const fu = /\b(?:follow[- ]?up|come back|see (?:me|her|him|them) again|recheck)\b[^.]*?\bin\s+((?:\d+|a few|two|three|four|six|eight)\s+(?:days?|weeks?|months?))/i.exec(s);
    if (fu && !out.provider.followUp) [out.provider.followUp, conf['provider.followUp']] = [`In ${fu[1]}`, 0.85];
    if (!/\b(follow[- ]?up|come back|schedul\w*|book\w*|referr\w*|appointment|pick up|go to|call)\b/i.test(s)) continue;
    const text = cap(tidy(s.replace(/[.!?]$/, '')));
    if (out.nextSteps.some((n) => n.text === text)) continue;
    out.nextSteps.push({ text, book: /\b(schedul|book|referr|appointment)/i.test(s) });
    conf.nextSteps = 0.75;
  }
}

/** Fill a visit outcome from free text. Only empty fields are filled; lists append new items. */
export function extractVisitOutcome(text: string, prev: VisitOutcome, prevConf: VisitConfidence = {}): { outcome: VisitOutcome; confidence: VisitConfidence } {
  const out: VisitOutcome = {
    ...prev,
    provider: { ...prev.provider },
    takeaway: { ...prev.takeaway },
    tests: [...prev.tests],
    medChanges: [...prev.medChanges],
    nextSteps: [...prev.nextSteps],
  };
  const conf: VisitConfidence = { ...prevConf };
  // A question ("should I stop my magnesium?") is not a report of what happened.
  const parts = sentences(text).filter((p) => !p.endsWith('?'));
  if (!out.provider.specialty) specialty(text, out, conf);
  if (!out.provider.name) providerName(text, out, conf);
  takeaway(parts, out, conf);
  tests(clauses(parts), out, conf);
  meds(clauses(parts), out, conf);
  nextSteps(parts, out, conf);
  return { outcome: out, confidence: conf };
}
