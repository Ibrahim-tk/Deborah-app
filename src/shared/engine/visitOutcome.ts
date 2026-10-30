/**
 * Log your visit (docs/ux/F09c-log-visit.md · Miro Step 6): the visit record, probes for gaps,
 * profile facts to confirm, the seed for "Discuss this with the Oracle", and the debrief opening.
 * Pure: no store, no timers. Conversation wiring arrives in log-visit phase 3.
 */
import { debriefScript as d, DEBRIEF_SCRIPT_ID, visitSpecialties } from '../data';
import type { Conversation, DebriefState, Note, Profile, VisitOutcome, VisitProbeId } from '../types/domain';
import type { EngineContext, Step } from '../types/engine';
import { formatShortDate } from '../utils/dates';
import { uid } from '../utils/ids';
import { interpolate } from '../utils/text';
import { deborahText, pause } from './plans';

export { extractVisitOutcome, type VisitConfidence } from './visitExtract';

/** Spec: at most three follow-up questions, each skippable. */
export const MAX_VISIT_PROBES = 3;
/** Below this an extracted value shows "Check this" on M-9.8. */
export const VISIT_CHECK_THIS = 0.7;
const PROBE_ORDER: VisitProbeId[] = ['specialty', 'said', 'tests', 'meds'];

export function emptyVisitOutcome(now: string, brief?: Note): VisitOutcome {
  return {
    visitDate: brief?.brief?.appointmentDate ?? now,
    briefNoteId: brief?.id,
    reason: brief?.brief?.chiefComplaint,
    provider: {},
    takeaway: {},
    tests: [],
    medChanges: [],
    nextSteps: [],
    status: 'placeholder',
  };
}

export const specialtyLabel = (o: VisitOutcome) =>
  o.provider.specialty === 'other' ? o.provider.specialtyOther || 'provider' : visitSpecialties.find((s) => s.id === o.provider.specialty)?.short;

const filled = (o: VisitOutcome, p: VisitProbeId) =>
  ({ specialty: !!o.provider.specialty, said: !!o.takeaway.said?.trim(), tests: o.tests.length > 0, meds: o.medChanges.length > 0 })[p];

/** Spec "enough context": provider specialty and what they said. */
export const hasEnoughVisitContext = (o: VisitOutcome) => filled(o, 'specialty') && filled(o, 'said');

/** A visit note cannot be saved until the provider's specialty is known. "Other" needs the written kind. */
export function hasProviderSpecialty(o: VisitOutcome): boolean {
  if (!o.provider.specialty) return false;
  if (o.provider.specialty === 'other') return Boolean(o.provider.specialtyOther?.trim());
  return true;
}

/** The next gap to ask about, or undefined when done (all filled, or three asked). */
export function nextVisitProbe(o: VisitOutcome, asked: VisitProbeId[]): VisitProbeId | undefined {
  if (asked.length >= MAX_VISIT_PROBES) return undefined;
  return PROBE_ORDER.find((p) => !asked.includes(p) && !filled(o, p));
}

/** True when nothing at all is recorded (Save disabled on M-9.8). */
export function isVisitOutcomeEmpty(o: VisitOutcome): boolean {
  return !o.provider.specialty && !o.provider.name && !o.provider.practice && !o.provider.followUp
    && !o.takeaway.said && !o.takeaway.understanding && !o.takeaway.unanswered
    && !o.tests.length && !o.medChanges.length && !o.nextSteps.length && !o.ownNotes?.trim();
}

/** One toggleable row in M-9.8 › Profile updates. */
export interface VisitProfileUpdate {
  key: string;
  name: string;
  change: 'started' | 'stopped';
  label: string;
}

/**
 * Profile updates to confirm (M-9.8 › Profile updates). Started adds, stopped removes; a dose change
 * or "continue" never edits the profile (doses are not stored as clinical truth).
 * OPEN: "Does a med change update the profile medication list automatically?" — default: only these confirmed rows.
 */
export function visitProfileUpdates(o: VisitOutcome, profile: Profile): VisitProfileUpdate[] {
  const current = new Set((profile.health?.medications?.value ?? []).map((m) => m.name.toLowerCase()));
  return o.medChanges.flatMap((m): VisitProfileUpdate[] => {
    const name = m.name.trim();
    const known = current.has(name.toLowerCase());
    if (!name || (m.change === 'started' && known) || (m.change === 'stopped' && !known)) return [];
    if (m.change !== 'started' && m.change !== 'stopped') return [];
    const label = m.change === 'started' ? `Add ${name} to my medications` : `Remove ${name} from my medications`;
    return [{ key: `${m.change}:${name.toLowerCase()}`, name, change: m.change, label }];
  });
}

/** Step 3 seed after "Yes, let's talk": topic and Oracle's memory line. */
export function debriefToConsultSeed(o: VisitOutcome): { topic: string; memory: string } {
  const specialty = specialtyLabel(o) ?? 'provider';
  return {
    topic: o.reason || `After my ${specialty} visit`,
    memory: interpolate(d.consultMemory, { specialty, date: formatShortDate(o.visitDate), said: o.takeaway.said ?? 'no details yet' }),
  };
}

const TEST_STATUS = { ordered: 'ordered', done: 'done', results: 'results back' } as const;
const CHANGE = { started: 'started', stopped: 'stopped', dose: 'dose changed', continue: 'continue' } as const;

/** One line per filled bucket — the debrief summary card and the Records row preview. */
export function visitSummaryLines(o: VisitOutcome): { label: string; text: string }[] {
  const out: { label: string; text: string }[] = [];
  const provider = [specialtyLabel(o) && visitSpecialties.find((s) => s.id === o.provider.specialty)?.label, o.provider.name].filter(Boolean).join(' · ');
  if (provider) out.push({ label: 'Provider seen', text: provider });
  if (o.takeaway.said) out.push({ label: 'What they said', text: o.takeaway.said });
  if (o.tests.length) out.push({ label: 'Tests ordered', text: o.tests.map((t) => `${t.name} (${TEST_STATUS[t.status]})`).join(', ') });
  if (o.medChanges.length) out.push({ label: 'Medication changes', text: o.medChanges.map((m) => `${m.name} — ${CHANGE[m.change]}`).join(', ') });
  if (o.nextSteps.length) out.push({ label: 'Next steps', text: o.nextSteps.map((n) => n.text).join('; ') });
  if (o.ownNotes?.trim()) out.push({ label: 'My own notes', text: o.ownNotes.trim() });
  return out;
}

/** Plain text for Share. */
export function visitOutcomeToText(o: VisitOutcome, profileName: string): string {
  const head = [`After my visit — ${profileName}`, `Visit date: ${formatShortDate(o.visitDate)}`];
  if (o.reason) head.push(`Reason: ${o.reason}`);
  if (o.provider.practice) head.push(`Practice: ${o.provider.practice}`);
  if (o.provider.followUp) head.push(`Follow-up: ${o.provider.followUp}`);
  const body = visitSummaryLines(o).map((l) => `${l.label}: ${l.text}`);
  if (o.takeaway.understanding) body.push(`My understanding: ${o.takeaway.understanding}`);
  if (o.takeaway.unanswered) body.push(`Still unanswered: ${o.takeaway.unanswered}`);
  return [...head, '', ...body].join('\n');
}

export const isDebrief = (c: Conversation) => c.status === 'debrief';

/** Opens the debrief (stage `opening`). `brief` links a Step 5 provider-brief note. */
export function startDebriefSteps(ctx: EngineContext, brief?: Note): Step[] {
  const prev = ctx.conversation;
  if (prev.status === 'debrief' && prev.debrief?.stage === 'opening') return [];
  const outcome = emptyVisitOutcome(ctx.now, brief);
  const debrief: DebriefState = { stage: 'opening', outcome, confidence: {}, asked: [] };
  const conv: Conversation = {
    id: uid('c'),
    profileId: ctx.profile.id,
    scriptId: DEBRIEF_SCRIPT_ID,
    status: 'debrief',
    debrief,
    messages: [],
    startedAt: ctx.now,
  };
  // A brief has no specialty (Miro: not on the brief), so the opening is generic unless one is known.
  const specialty = specialtyLabel(outcome);
  const opening = interpolate(specialty ? d.openingWithSpecialty : d.opening, { name: ctx.profile.name, specialty });
  return [
    { type: 'store', action: { type: 'startConversation', conversation: conv } },
    ...pause(d.thinking, 500, 800),
    ...deborahText(ctx, `${opening} ${d.openingPrompt}`, { quickReplies: { options: d.openingOptions } }),
  ];
}
