/** Form state + validation for M-6.2. "Today" is the simulated clock, never the real one. */
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ageOn } from '@shared/engine';
import { useAppStore } from '@shared/store';
import type { Profile } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';

type Relation = Exclude<Profile['relationship'], 'self'>;

export interface MemberValues {
  name: string;
  relationship?: Relation;
  dob: string;
  sex?: NonNullable<Profile['sexAtBirth']>;
}

/** yyyy-mm-dd in local time, for <input type="date">. */
const toDateInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function useMemberForm() {
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const now = nowFrom(clock);
  const today = toDateInput(now);

  const [values, setValues] = useState<MemberValues>({ name: '', dob: '' });
  // Consent is tied to the wording it was given for: if the age flips minor/adult, it must be re-given.
  const [consentFor, setConsentFor] = useState<'minor' | 'adult' | null>(null);

  const set = (patch: Partial<MemberValues>) => setValues((v) => ({ ...v, ...patch }));

  const dobValid = /^\d{4}-\d{2}-\d{2}$/.test(values.dob) && !Number.isNaN(new Date(`${values.dob}T12:00:00`).getTime());
  const future = dobValid && values.dob > today;
  const age = dobValid && !future ? ageOn(`${values.dob}T12:00:00`, now) : null;
  // Before a DOB is entered, the relationship decides which consent wording is shown.
  const minor = age !== null ? age < 18 : values.relationship === 'daughter' || values.relationship === 'son';
  const underThirteen = age !== null && age < 13;
  const kind = minor ? 'minor' : 'adult';
  const consented = consentFor === kind;

  const dobError = future ? 'Date of birth can’t be in the future.' : undefined;
  const valid = values.name.trim().length > 0 && Boolean(values.relationship) && age !== null && !underThirteen && consented;
  const dirty = Boolean(values.name.trim() || values.relationship || values.dob || values.sex || consentFor);

  return {
    values,
    set,
    today,
    age,
    minor,
    underThirteen,
    dobError,
    consented,
    setConsent: (checked: boolean) => setConsentFor(checked ? kind : null),
    valid,
    dirty,
  };
}
