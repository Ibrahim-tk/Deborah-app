/**
 * @screen  W-1.13 · Your age
 * @flow    F01 onboarding · age / eligibility check (FigJam teen-account board)
 * @presentation page — right after the first name (Welcome or M-1.11)
 * @states  empty · date chosen · [under 13 → M-1.10] · [teen invite → M-1.4 locked email]
 * @figma   —
 * @spec    FigJam "Teen account setup" (OPEN: add M-1.13 to docs/ux/F01-onboarding.md)
 * @xref    mobile: M-1.13 (apps/mobile/screens/onboarding/AgeSheet) — bottom sheet there
 *
 * Date of birth + one searchable City (gives state and country) → applicable age category.
 * OPEN: "DOB + State/Country → applicable age category" — default age of majority 18 everywhere.
 */
import { useState, type FormEvent } from 'react';
import { ageFromDob, useAppStore } from '@shared/store';
import { teenAccountCopy } from '@shared/data';
import { nowFrom } from '@shared/utils';
import { Button, DateField, TextReveal } from '@web/ui';
import { CityField, type Place } from '@web/patterns/widgets';
import { useNav, useScreenParams } from '@web/navigation';
import styles from './AgeStep.module.css';

const THIS_YEAR = new Date().getFullYear();
export default function AgeStep() {
  // `next: 'health'` — reached from M-1.11 after guest chat (account already exists): continue to M-1.8.
  const { first = '', invite, next } = useScreenParams<{ first: string; invite?: string; next?: 'health' }>();
  const { replace, push, presentSheet } = useNav();
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
    if (ageFromDob(dob, nowFrom(s)) < 13) return presentSheet('M-1.10');
    // OPEN: 13–17 signing up without a Family Plan invitation — the board only covers the invite route.
    if (next === 'health') return push('M-1.8', { returnTo: 'chat' });
    replace('M-1.4', { first, invite }, 'fade');
  };

  return (
    <div className={styles.root} data-xref="W-1.13 · Your age">
      <form className={styles.stage} onSubmit={submit} noValidate>
        <header className={styles.header}>
          <TextReveal as="h1" className={styles.prompt} text={`Nice to meet you${first ? `, ${first}` : ''}`} delay={200} />
          <TextReveal className={styles.lede} text="When were you born? Your age shapes what Oracle can offer you." delay={500} />
        </header>
        <div className={styles.fields}>
          <DateField label="Date of birth" value={dob} onChange={setDob} minYear={THIS_YEAR - 110} maxYear={THIS_YEAR} defaultYear={THIS_YEAR - 30} error={errors.dob} />
          <CityField value={place} error={errors.city} onChange={(p) => { setPlace(p); setErrors((x) => ({ ...x, city: undefined })); }} />
          <Button type="submit" fullWidth>Continue</Button>
        </div>
      </form>
    </div>
  );
}
