/**
 * Form state + validation for M-6.2. Questions are the onboarding intake's "someone else" steps
 * (healthBasics.json): relationship → name → DOB → sex → gender → pronouns, with the same showIf
 * branches and child labels. "Today" is the simulated clock, never the real one.
 */
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { ageFromAnswers, visibleSteps, type Answers, type Step } from '@mobile/screens/onboarding/HealthBasics/steps';

/** yyyy-mm-dd in local time, for <input type="date">. */
const toDateInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
/** Form rows: everything the intake asks about someone else except the who-for tiles and the consent sheet. */
const FIELD_KINDS = new Set<Step['kind']>(['choice', 'name', 'date']);

export function useMemberForm() {
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const now = nowFrom(clock);
  const today = toDateInput(now);

  const [answers, setAnswers] = useState<Answers>({ profileFor: 'dependent' });
  const set = (key: string, value: string) => setAnswers((a) => ({ ...a, [key]: value }));

  const fields = visibleSteps(answers).filter((s) => FIELD_KINDS.has(s.kind));
  const dob = answers.birthDate ?? '';
  const future = Boolean(dob) && dob > today;
  const age = future ? undefined : ageFromAnswers(answers, now);
  const dobError = future ? 'Date of birth can’t be in the future.' : undefined;

  const answered = (s: Step) => {
    const v = answers[s.key]?.trim() ?? '';
    if (s.kind === 'name') return NAME_PATTERN.test(v);
    if (s.kind === 'date') return age !== undefined;
    if (!v) return false;
    // "Someone else" / "Not listed" / "Other" need their written-in answer too.
    return s.describeValue !== v || !s.describeKey || Boolean(answers[s.describeKey]?.trim());
  };
  const valid = fields.every(answered);
  const dirty = Object.entries(answers).some(([k, v]) => k !== 'profileFor' && Boolean(v?.trim()));

  return { answers, set, fields, today, age, dobError, valid, dirty };
}
