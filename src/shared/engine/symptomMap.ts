/**
 * M-7.9 Symptoms map — merge profile + chat symptoms onto hypothalamic domains.
 * Pure; no store. Seed fills an empty profile so the future UI has demo content.
 */
import { symptomMap } from '../data';
import type { Conversation, Profile } from '../types/domain';
import type { MappedSymptom, SymptomMapSource } from '../types/health';

export interface SymptomMapResult {
  symptoms: MappedSymptom[];
  domainsHit: string[];
}

function norm(label: string): string {
  return label.trim().toLowerCase();
}

/** Case-insensitive substring match of a label against each domain's symptom list. */
function matchDomainIds(label: string): string[] {
  const needle = norm(label);
  if (!needle) return [];
  return symptomMap.domains
    .filter((d) => d.symptoms.some((s) => {
      const hay = norm(s);
      return hay.includes(needle) || needle.includes(hay);
    }))
    .map((d) => d.id);
}

function mapLabel(label: string, source: SymptomMapSource): MappedSymptom {
  return { label, source, domainIds: matchDomainIds(label) };
}

/**
 * Merge `profile.intake.symptoms` (health-profile source) with optional chat-tagged
 * labels; fall back to `seedSymptoms` when both are empty.
 */
export function resolveSymptomMap(profile: Profile | undefined, chatSymptoms: string[] = []): SymptomMapResult {
  const byKey = new Map<string, MappedSymptom>();

  for (const label of profile?.intake.symptoms ?? []) {
    const key = norm(label);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, mapLabel(label, 'profile'));
  }
  for (const label of chatSymptoms) {
    const key = norm(label);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, mapLabel(label, 'chat'));
  }

  let symptoms = [...byKey.values()];
  if (symptoms.length === 0) {
    symptoms = symptomMap.seedSymptoms.map((label) => mapLabel(label, 'seed'));
  }

  const domainsHit = [...new Set(symptoms.flatMap((s) => s.domainIds))];
  return { symptoms, domainsHit };
}

/** An area's own symptom labels that match a reported symptom (for the ring's dot marker). */
export function reportedInDomain(domainId: string, result: SymptomMapResult): string[] {
  const domain = symptomMap.domains.find((d) => d.id === domainId);
  if (!domain) return [];
  const labels = result.symptoms.filter((s) => s.domainIds.includes(domainId)).map((s) => norm(s.label));
  return domain.symptoms.filter((s) => {
    const hay = norm(s);
    return labels.some((l) => hay.includes(l) || l.includes(hay));
  });
}

/**
 * Intelligent chat-tile trigger: 3+ real (non-seed) symptoms across 2+ domains.
 * Seed-only maps never offer the tile.
 */
export function shouldOfferSymptomMap(profile: Profile, chatSymptoms: string[] = []): boolean {
  const byKey = new Map<string, MappedSymptom>();
  for (const label of profile.intake.symptoms ?? []) {
    const key = norm(label);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, mapLabel(label, 'profile'));
  }
  for (const label of chatSymptoms) {
    const key = norm(label);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, mapLabel(label, 'chat'));
  }
  const mapped = [...byKey.values()].filter((s) => s.domainIds.length > 0);
  const domainsHit = new Set(mapped.flatMap((s) => s.domainIds));
  return mapped.length >= 3 && domainsHit.size >= 2;
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
