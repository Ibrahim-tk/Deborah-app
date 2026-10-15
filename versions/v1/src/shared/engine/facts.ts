/**
 * Review and Confirm (meeting 2026-10-12 · B, plan C-09/C-10, node DN-13). The engine never writes the
 * profile: anything it learns becomes a pending fact on the conversation. Pending facts count as known
 * inside that conversation (no question repeats), and reach the profile only when the user confirms them.
 */
import { chatIntakeData, intakeData } from '../data';
import type { IntakeQuestion } from '../types/content';
import type { Conversation, Intake, PendingFact, Profile } from '../types/domain';
import { uid } from '../utils/ids';

type Patch = PendingFact['patch'];

const label = (key: string) => chatIntakeData.factLabels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

/** Option ids stored in the intake ("thyroid-med") shown as their labels ("Thyroid medicine"). */
function display(key: string, value: unknown): string {
  const ids = Array.isArray(value) ? value.map(String) : [String(value)];
  const q = [...intakeData.questions, ...chatIntakeData.questions].find((x) => x.profileField === `intake.${key}` || x.profileField === `profile.${key}`);
  const names = ids.map((id) => (id === 'none' ? 'None' : (q?.options.find((o) => o.id === id)?.label ?? id)));
  return names.join(', ');
}

/** The profile as this conversation knows it: saved data plus facts still waiting for Confirm. */
export function withFacts(profile: Profile, facts: PendingFact[] | undefined): Profile {
  return (facts ?? [])
    .filter((f) => f.status === 'pending')
    .reduce<Profile>((p, f) => ({ ...p, ...f.patch.profile, intake: { ...p.intake, ...f.patch.intake } }), profile);
}

/** True when the question's answer belongs on the profile (not only in this conversation). */
export const isProfileFact = (q: IntakeQuestion) => !q.profileField.startsWith('conversation.') && !q.profileField.startsWith('session.');

/** One fact per answered profile question. `value` is what the user saw in their bubble. */
export function factFromAnswer(q: IntakeQuestion, patch: Patch, value: string): PendingFact | null {
  if (!isProfileFact(q) || (!Object.keys(patch.intake ?? {}).length && !Object.keys(patch.profile ?? {}).length)) return null;
  const key = q.profileField.replace(/^(intake|profile)\./, '');
  // "When was your last period?" is saved as the stage it points to, so show the stage.
  const shown = q.id === 'last-period' && patch.intake?.reproductive ? display('reproductive', patch.intake.reproductive) : value;
  return { id: uid('f'), key, questionId: q.id, label: label(key), value: shown, patch, source: 'answer', status: 'pending' };
}

/** Facts picked up from what the user typed (extract.ts), e.g. "I take levothyroxine". */
export function factsFromMessage(inferred: { intake: Partial<Intake>; profile: Partial<Profile> }): PendingFact[] {
  const out: PendingFact[] = [];
  for (const [key, value] of Object.entries(inferred.intake)) {
    if (key === 'ageBand') continue; // carried by the birth-year fact below
    out.push({ id: uid('f'), key, label: label(key), value: display(key, value), patch: { intake: { [key]: value } }, source: 'message', status: 'pending' });
  }
  const { health, sexAtBirth } = inferred.profile;
  if (health?.birthYear) {
    out.push({
      id: uid('f'),
      key: 'birthYear',
      label: 'Year of birth',
      value: String(health.birthYear.value),
      patch: { profile: { health }, intake: inferred.intake.ageBand ? { ageBand: inferred.intake.ageBand } : {} },
      source: 'message',
      status: 'pending',
    });
  }
  if (sexAtBirth) out.push({ id: uid('f'), key: 'sex', label: label('sex'), value: display('sex', sexAtBirth), patch: { profile: { sexAtBirth } }, source: 'message', status: 'pending' });
  return out;
}

/** Newer facts replace older pending ones with the same key. */
export function mergeFacts(existing: PendingFact[] | undefined, incoming: PendingFact[]): PendingFact[] {
  const keys = new Set(incoming.map((f) => f.key));
  return [...(existing ?? []).filter((f) => f.status !== 'pending' || !keys.has(f.key)), ...incoming];
}

export const pendingFacts = (c: Pick<Conversation, 'facts'> | undefined) => (c?.facts ?? []).filter((f) => f.status === 'pending');
