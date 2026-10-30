/**
 * @screen  M-1.13 · Your age
 * @flow    F01 onboarding · age / eligibility check (FigJam teen-account board)
 * @presentation sheet over Welcome (M-1.2), right after the first name
 * @states  empty · date chosen · [under 13 → M-1.10] · [teen invite → M-1.4 locked email]
 * @figma   —
 * @spec    FigJam "Teen account setup" (OPEN: add M-1.13 to docs/ux/F01-onboarding.md)
 * @xref    web: W-1.13 (apps/web/screens/onboarding/AgeStep) — page instead of a sheet
 *
 * Date of birth + one searchable City (gives state and country) → applicable age category. Then the sign-up sheet (M-1.4).
 * OPEN: "DOB + State/Country → applicable age category" — default age of majority 18 everywhere.
 */
import { useState, type FormEvent } from 'react';
import { ageFromDob, useAppStore } from '@shared/store';
import { teenAccountCopy } from '@shared/data';
import { nowFrom } from '@shared/utils';
import { Button, DateField, Sheet } from '@mobile/ui';
import { CityField, type Place } from '@mobile/patterns/widgets';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './AgeSheet.module.css';

const THIS_YEAR = new Date().getFullYear();
export default function AgeSheet() {
  const { first = '', invite } = useScreenParams<{ first: string; invite?: string }>();
  const { dismissSheet, presentSheet } = useNav();
  const [dob, setDob] = useState('');
  // One searchable City field gives city, state and country together (designer, 2026-10-30).
  const [place, setPlace] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Partial<Record<'dob' | 'city', string>>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Every field is required (story 1.5).
    const required = teenAccountCopy.errors.required;
    const missing = { dob: dob ? undefined : required, city: place ? undefined : required };
    setErrors(missing);
    if (missing.dob || missing.city || !place) return;
    const s = useAppStore.getState();
    s.setAccountAge(dob, place.countryCode, place.state, place.city);
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
          <CityField value={place} error={errors.city} onChange={(p) => { setPlace(p); setErrors((x) => ({ ...x, city: undefined })); }} />
          <Button type="submit" fullWidth>Continue</Button>
        </form>
      </Sheet>
    </div>
  );
}
