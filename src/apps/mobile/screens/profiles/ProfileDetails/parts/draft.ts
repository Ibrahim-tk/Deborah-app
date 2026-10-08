/** Editable copy of a profile for M-6.5's inline editing, plus option lists from intake data. */
import { intakeData } from '@shared/data';
import type { AgeBand, Intake, Profile, Relationship } from '@shared/types/domain';

export interface ProfileDraft {
  name: string;
  relationship: Relationship;
  /** yyyy-mm-dd or '' */
  dob: string;
  intake: Intake;
  /** Free-text medications, comma separated. */
  medsText: string;
}

/** yyyy-mm-dd in local time, for <input type="date">. */
export const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dobInput = (dob?: string) => (!dob ? '' : /^\d{4}-\d{2}-\d{2}$/.test(dob) ? dob : toDateInput(new Date(dob)));

export const toDraft = (p: Profile): ProfileDraft => ({
  name: p.name,
  relationship: p.relationship,
  dob: dobInput(p.dob),
  intake: { ...p.intake },
  medsText: p.intake.medications.join(', '),
});

/** Store patches from a draft; an emptied name keeps the old one. */
export function fromDraft(p: Profile, d: ProfileDraft) {
  return {
    profile: {
      name: d.name.trim() || p.name,
      relationship: d.relationship,
      dob: d.dob ? new Date(`${d.dob}T12:00:00`).toISOString() : p.dob,
    },
    intake: {
      ...d.intake,
      medications: d.medsText.split(',').map((m) => m.trim()).filter(Boolean),
      notes: d.intake.notes?.trim() || undefined,
    },
  };
}

const optionsOf = (questionId: string) =>
  (intakeData.questions.find((q) => q.id === questionId)?.options ?? []).map((o) => ({ value: o.id, label: o.label }));

export const AGE_BANDS = [...optionsOf('age'), { value: 'teen', label: 'Under 18' }] as { value: AgeBand; label: string }[];
/** The intake's "medications or diagnosed conditions" question feeds intake.conditions. */
export const CONDITIONS = optionsOf('meds');
export const CYCLES = optionsOf('cycle') as { value: NonNullable<Intake['cycle']>; label: string }[];
export const ONSETS = optionsOf('teen-onset');

export const labelOf = (list: { value: string; label: string }[], v?: string) => list.find((o) => o.value === v)?.label;
