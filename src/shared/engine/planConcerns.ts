/**
 * One healing plan per profile. Seeded concerns reuse the clinical document's words.
 * Later answers prepend a concern; they do not open a second plan.
 */
import { healingPlanDocument } from '../data';
import type { Note, Plan90, PlanAction, PlanConcern, Profile } from '../types/domain';
import { addDays } from '../utils/dates';
import { uid } from '../utils/ids';
import { specialtyLabel } from './visitOutcome';

/** Shown only when a visit specialty is already on file. The matching rule is still placeholder. */
export const PROVIDER_MISMATCH_NOTE = 'Worth confirming this provider is the right one for this concern.';

const action = (id: string, text: string, well: PlanAction['well'], extra: Partial<PlanAction> = {}): PlanAction => ({
  id,
  text,
  well,
  done: false,
  ...extra,
});

/** The document's conditions and to-do, as one list. Newest (the immediate dietary action) is first. */
export function concernsFromDocument(addedAt: string): PlanConcern[] {
  const at = (daysAgo: number) => addDays(addedAt, -daysAgo);
  const doc = healingPlanDocument;
  const pcos = doc.conditions.find((c) => c.id === 'pcos');
  const gut = doc.conditions.find((c) => c.id === 'gut');
  const prolactin = doc.conditions.find((c) => c.id === 'prolactin');
  const todo = doc.conditions.find((c) => c.id === 'todo');
  return [
    {
      id: 'c-diet',
      title: doc.callout.title,
      addedAt: at(0),
      status: 'active',
      actions: [
        action('a-diet-log', todo?.items[0] ?? doc.callout.body, 'now'),
        action('a-brazil', todo?.items[1] ?? 'Consider adding 2 Brazil nuts/day for selenium to support T4→T3 conversion', 'daily'),
      ],
    },
    {
      id: 'c-pcos',
      title: pcos?.title ?? 'For PCOS',
      addedAt: at(1),
      status: 'active',
      actions: [
        action('a-gold', pcos?.items[0] ?? '', 'daily', { safety: true }),
        action('a-amh', pcos?.items[1] ?? '', 'labs'),
        action('a-cycle', pcos?.items[2] ?? '', 'now', { note: pcos?.note }),
      ].filter((a) => a.text),
    },
    {
      id: 'c-gut',
      title: gut?.title ?? 'Intestinal Dysbiosis',
      addedAt: at(2),
      status: 'active',
      mismatch: PROVIDER_MISMATCH_NOTE,
      actions: [
        action('a-genova', gut?.items[0] ?? '', 'labs'),
        action('a-berberine', gut?.items[1] ?? '', 'now', { safety: true, note: gut?.note }),
      ].filter((a) => a.text),
    },
    {
      id: 'c-prolactin',
      title: prolactin?.title ?? 'Hyperprolactinemia',
      addedAt: at(3),
      status: 'active',
      actions: [action('a-bromo', prolactin?.items[0] ?? '', 'provider', { note: prolactin?.note })].filter((a) => a.text),
    },
  ];
}

export function withConcerns(plan: Plan90): Plan90 {
  if (plan.concerns?.length) return plan;
  return { ...plan, concerns: concernsFromDocument(plan.startDate) };
}

export function concernFromAnswer(title: string, habits: string[], addedAt: string): PlanConcern {
  const raw = title.trim() || 'New concern';
  const label = raw.charAt(0).toUpperCase() + raw.slice(1);
  return {
    id: uid('c'),
    title: label,
    addedAt,
    status: 'active',
    actions: habits.filter(Boolean).map((text) => action(uid('a'), text, 'daily')),
  };
}

export function profileHasMedicines(profile: Profile | undefined): boolean {
  if (!profile) return false;
  const named = (profile.health?.medications?.value ?? []).map((m) => m.name.trim()).filter(Boolean);
  if (named.length) return true;
  return (profile.intake?.medications ?? []).some((m) => {
    const name = m.trim().toLowerCase();
    return Boolean(name) && name !== 'none' && name !== 'nkda';
  });
}

/** Specialties recorded on this profile's visit notes, in note order, without duplicates. */
export function careTeamFromNotes(notes: Note[]): string {
  const labels: string[] = [];
  for (const note of notes) {
    if (note.kind !== 'after-visit' || !note.visit) continue;
    const label = specialtyLabel(note.visit);
    if (!label || label === 'provider' || labels.includes(label)) continue;
    labels.push(label);
  }
  return labels.join(', ');
}

export function activeConcerns(plan: Plan90 | undefined): PlanConcern[] {
  return (plan ? withConcerns(plan).concerns ?? [] : []).filter((c) => c.status === 'active');
}

/** Newest concern title, and how many actions on the active list are done. */
export function activePlanSummary(plan: Plan90 | undefined): { concern?: string; done: number; total: number } {
  const concerns = activeConcerns(plan);
  const actions = concerns.flatMap((c) => c.actions);
  return {
    concern: concerns[0]?.title,
    done: actions.filter((a) => a.done).length,
    total: actions.length,
  };
}

/** What Deborah reads before she answers. Empty when this profile has no plan. */
export function healingPlanContext(plan: Plan90 | undefined, profile: Profile, notes: Note[]): string | undefined {
  if (!plan) return undefined;
  const full = withConcerns(plan);
  const concerns = full.concerns ?? [];
  const active = concerns.filter((c) => c.status === 'active');
  const resolved = concerns.filter((c) => c.status === 'resolved').map((c) => c.title);
  const open = active.flatMap((c) => c.actions.filter((a) => !a.done).map((a) => a.text));
  const meds = [
    ...(profile.health?.medications?.value ?? []).map((m) => m.name.trim()),
    ...(profile.intake?.medications ?? []),
  ].filter((name) => {
    const n = name.trim().toLowerCase();
    return Boolean(n) && n !== 'none' && n !== 'nkda';
  });
  const specialties = careTeamFromNotes(notes);
  const parts = [
    active.length ? `Active concerns: ${active.map((c) => c.title).join('; ')}` : '',
    open.length ? `Open actions: ${open.join('; ')}` : '',
    resolved.length ? `Resolved: ${resolved.join('; ')}` : '',
    meds.length ? `Medicines: ${meds.join(', ')}` : '',
    specialties ? `Provider specialties: ${specialties}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join('. ') : undefined;
}
