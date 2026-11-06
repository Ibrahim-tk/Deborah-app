/**
 * M-7.9 Symptoms map — merge profile + chat symptoms onto hypothalamic areas.
 * Pure; no store. The seed fills an empty map only when the caller asks for the demo.
 */
import { symptomMap } from '../data';
import type { Conversation, Profile } from '../types/domain';
import type { MappedSymptom, SymptomMapSource } from '../types/health';

export interface SymptomMapResult {
  symptoms: MappedSymptom[];
  domainsHit: string[];
}

/** Overlap read-out for the overview: bridges are reported symptoms that sit in 2+ areas. */
export interface SymptomMapSummary {
  total: number;
  areas: number;
  bridges: { label: string; domainIds: string[] }[];
  /** 0 none · 1 one or two reported · 2 three or more. */
  strength: Record<string, 0 | 1 | 2>;
  sentence: string;
}

function norm(label: string): string {
  return label.trim().toLowerCase();
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-word phrase match either way ("Fatigue" ↔ "Fatigue / exhaustion"), never mid-word. */
function labelsMatch(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  const within = (needle: string, hay: string) => new RegExp(`(^|[^a-z])${escape(needle)}($|[^a-z])`).test(hay);
  return within(x, y) || within(y, x);
}

function matchDomainIds(label: string): string[] {
  return symptomMap.domains.filter((d) => d.symptoms.some((s) => labelsMatch(label, s))).map((d) => d.id);
}

function mapLabel(label: string, source: SymptomMapSource, date?: string): MappedSymptom {
  return { label, source, date, domainIds: matchDomainIds(label) };
}

function collect(profile: Profile | undefined, conversations: Conversation[]): MappedSymptom[] {
  const byKey = new Map<string, MappedSymptom>();
  const add = (label: string, source: SymptomMapSource, date?: string) => {
    const key = norm(label);
    if (key && !byKey.has(key)) byKey.set(key, mapLabel(label, source, date));
  };
  for (const label of profile?.intake.symptoms ?? []) add(label, 'profile');
  const newestFirst = [...conversations].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  for (const c of newestFirst) for (const label of chatSymptomsFrom(c)) add(label, 'chat', c.startedAt);
  return [...byKey.values()];
}

/**
 * Health-profile symptoms first, then symptoms picked or confirmed in the profile's conversations
 * (newest first). `demo` fills an otherwise empty map with `seedSymptoms`.
 */
export function resolveSymptomMap(profile: Profile | undefined, conversations: Conversation[] = [], demo = false): SymptomMapResult {
  let symptoms = collect(profile, conversations);
  if (symptoms.length === 0 && demo) symptoms = symptomMap.seedSymptoms.map((label) => mapLabel(label, 'seed'));
  const domainsHit = [...new Set(symptoms.flatMap((s) => s.domainIds))];
  return { symptoms, domainsHit };
}

/** An area's own symptom labels that match a reported symptom (for the dot marker). */
export function reportedInDomain(domainId: string, result: SymptomMapResult): string[] {
  const domain = symptomMap.domains.find((d) => d.id === domainId);
  if (!domain) return [];
  const labels = result.symptoms.filter((s) => s.domainIds.includes(domainId)).map((s) => s.label);
  return domain.symptoms.filter((s) => labels.some((l) => labelsMatch(l, s)));
}

/** The reported symptom behind an area's label (for provenance and "Also in…"). */
export function sourceOf(areaLabel: string, result: SymptomMapResult): MappedSymptom | undefined {
  return result.symptoms.find((s) => labelsMatch(s.label, areaLabel));
}

/** The area to open from the chat tile: the one holding most of the just-mentioned symptoms. */
export function focusAreaFor(labels: string[]): string | undefined {
  const counts = new Map<string, number>();
  for (const l of labels) for (const id of matchDomainIds(l)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function summarizeSymptomMap(result: SymptomMapResult): SymptomMapSummary {
  const mapped = result.symptoms.filter((s) => s.domainIds.length > 0);
  const strength: Record<string, 0 | 1 | 2> = {};
  for (const d of symptomMap.domains) {
    const n = reportedInDomain(d.id, result).length;
    strength[d.id] = n === 0 ? 0 : n < 3 ? 1 : 2;
  }
  const bridges = mapped
    .filter((s) => s.domainIds.length > 1)
    .sort((a, b) => b.domainIds.length - a.domainIds.length)
    .map((s) => ({ label: s.label, domainIds: s.domainIds }));
  const areas = result.domainsHit.length;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const top = bridges[0];
  const sentence = mapped.length === 0
    ? ''
    : `${plural(mapped.length, 'symptom')} across ${plural(areas, 'area')}${top ? ` · ${top.label} appears in ${top.domainIds.length}` : ''}`;
  return { total: mapped.length, areas, bridges, strength, sentence };
}

/**
 * Intelligent chat-tile trigger: 3+ real (non-seed) symptoms across 2+ areas.
 */
export function shouldOfferSymptomMap(profile: Profile, chatSymptoms: string[] = []): boolean {
  const byKey = new Map<string, MappedSymptom>();
  for (const label of [...(profile.intake.symptoms ?? []), ...chatSymptoms]) {
    const key = norm(label);
    if (key && !byKey.has(key)) byKey.set(key, mapLabel(label, 'chat'));
  }
  const mapped = [...byKey.values()].filter((s) => s.domainIds.length > 0);
  return mapped.length >= 3 && new Set(mapped.flatMap((s) => s.domainIds)).size >= 2;
}

/** Labels picked in this conversation's symptom clarifiers (and symptom facts). */
export function chatSymptomsFrom(conversation: Conversation): string[] {
  const out: string[] = [];
  for (const [qid, ids] of Object.entries(conversation.intakeAnswers ?? {})) {
    if (!qid.split('#')[0].startsWith('symptoms-')) continue;
    for (const id of ids) {
      if (id !== 'none' && id !== 'other') out.push(id);
    }
  }
  for (const f of conversation.facts ?? []) {
    if (f.key !== 'symptoms' || f.status === 'discarded') continue;
    for (const part of f.value.split(',')) {
      const t = part.trim();
      if (t) out.push(t);
    }
  }
  return out;
}
