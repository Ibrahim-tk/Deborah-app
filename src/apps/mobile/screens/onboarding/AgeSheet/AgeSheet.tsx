/**
 * @screen  M-1.13 · Your age
 * @flow    F01 onboarding · age / eligibility check (FigJam teen-account board)
 * @presentation sheet over Welcome (M-1.2), right after the first name
 * @states  empty · date chosen · [under 13 → M-1.10] · [teen invite → M-1.4 locked email]
 * @figma   —
 * @spec    FigJam "Teen account setup" (OPEN: add M-1.13 to docs/ux/F01-onboarding.md)
 * @xref    web: W-1.13 (apps/web/screens/onboarding/AgeStep) — page instead of a sheet
 *
 * Date of birth + state/country → applicable age category. Then the sign-up sheet (M-1.4).
 * OPEN: "DOB + State/Country → applicable age category" — default age of majority 18 everywhere.
 */
import { useState, type FormEvent } from 'react';
import { ageFromDob, useAppStore } from '@shared/store';
import { teenAccountCopy } from '@shared/data';
import { nowFrom } from '@shared/utils';
import { Button, DateField, Input, Select, Sheet } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './AgeSheet.module.css';

const THIS_YEAR = new Date().getFullYear();
const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'other', label: 'Somewhere else' },
];

export default function AgeSheet() {
  const { first = '', invite } = useScreenParams<{ first: string; invite?: string }>();
  const { dismissSheet, presentSheet } = useNav();
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('US');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'dob' | 'city' | 'state', string>>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Every field is required (story 1.5).
    const required = teenAccountCopy.errors.required;
    const missing = { dob: dob ? undefined : required, city: city.trim() ? undefined : required, state: state.trim() ? undefined : required };
    setErrors(missing);
    if (missing.dob || missing.city || missing.state) return;
    const s = useAppStore.getState();
    s.setAccountAge(dob, country, state.trim(), city.trim());
    dismissSheet();
    // Under 13 cannot hold their own account, invited or not.
    if (ageFromDob(dob, nowFrom(s)) < 13) return presentSheet('M-1.10');
    // OPEN: 13–17 signing up without a Family Plan invitation — the board only covers the invite route.
    presentSheet('M-1.4', { first, invite });
  };

  return (
    <div data-xref="M-1.13 · Your age">
      <Sheet title={`Nice to meet you${first ? `, ${first}` : ''}`} subtitle="When were you born? Your age shapes what Oracle can offer you.">
        <form className={styles.stage} onSubmit={submit} noValidate>
          <DateField label="Date of birth" value={dob} onChange={setDob} minYear={THIS_YEAR - 110} maxYear={THIS_YEAR} defaultYear={THIS_YEAR - 30} error={errors.dob} />
          <Select label="Country" options={COUNTRIES} value={country} onChange={setCountry} />
          <Input label="City" placeholder="e.g. San Diego" value={city} autoComplete="address-level2" error={errors.city} onChange={(e) => { setCity(e.target.value); setErrors((x) => ({ ...x, city: undefined })); }} />
          <Input label={country === 'US' ? 'State' : 'State / region'} placeholder="e.g. California" value={state} autoComplete="address-level1" error={errors.state} onChange={(e) => { setState(e.target.value); setErrors((x) => ({ ...x, state: undefined })); }} />
          <Button type="submit" fullWidth>Continue</Button>
        </form>
      </Sheet>
    </div>
  );
}
