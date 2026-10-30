/**
 * Generative appointment form (design 2026-10-21): after "Yes, I have an appointment", one small card with
 * the provider's name and the date, and a small Save at the bottom right (2026-10-21). Nothing else.
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { dayKey, nowFrom } from '@shared/utils';
import { Button, DateField, Input, Select } from '@web/ui';
import { visitSpecialties } from '@shared/data';
import styles from './AppointmentForm.module.css';

export interface Appointment {
  provider: string;
  /** Specialty label (e.g. "Gynecology"); optional. */
  specialty?: string;
  /** yyyy-mm-dd from the date field. */
  date: string;
}

export function AppointmentForm({ active, onSave }: { active: boolean; onSave: (a: Appointment) => void }) {
  const [provider, setProvider] = useState('');
  const [specialty, setSpecialty] = useState<string>();
  // "Other" opens a field to type the specialty (designer, 2026-10-28); the typed text is what's saved.
  const [otherSpecialty, setOtherSpecialty] = useState('');
  const isOther = specialty === 'Other';
  const savedSpecialty = isOther ? otherSpecialty.trim() || 'Other' : specialty;
  const [date, setDate] = useState('');
  // Today from the simulated clock; appointments are today or later.
  const today = dayKey(nowFrom(useAppStore.getState()));
  return (
    <form
      className={styles.root}
      aria-label="Appointment details"
      onSubmit={(e) => { e.preventDefault(); if (active && date) onSave({ provider: provider.trim(), specialty: savedSpecialty, date }); }}
    >
      <Input label="Provider name" placeholder="e.g. Dr. Patel" value={provider} autoCapitalize="words" disabled={!active} onChange={(e) => setProvider(e.target.value)} />
      <Select label="Specialty" options={visitSpecialties.map((o) => ({ value: o.label, label: o.label }))} value={specialty} onChange={setSpecialty} />
      {isOther && (
        <Input label="Which specialty?" placeholder="e.g. Dermatology" value={otherSpecialty} autoCapitalize="words" disabled={!active} onChange={(e) => setOtherSpecialty(e.target.value)} />
      )}
      {/* Same dropdown calendar as every date field (designer, 2026-10-31: no bottom sheet). */}
      <DateField label="Appointment date" placeholder="Pick a date" value={date} min={today} minYear={Number(today.slice(0, 4))} maxYear={Number(today.slice(0, 4)) + 2} defaultYear={Number(today.slice(0, 4))} disabled={!active} onChange={setDate} />
      {active && <Button type="submit" size="sm" className={styles.save} disabled={!date}>Save</Button>}
    </form>
  );
}
