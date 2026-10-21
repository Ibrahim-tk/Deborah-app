/**
 * Generative appointment form (design 2026-10-21): after "Yes, I have an appointment", one small card with
 * the provider's name and the date, and the flow's own primary button. Nothing else.
 */
import { useState } from 'react';
import { Button, Input } from '@mobile/ui';
import styles from './AppointmentForm.module.css';

export interface Appointment {
  provider: string;
  /** yyyy-mm-dd from the date field. */
  date: string;
}

export function AppointmentForm({ active, onSave }: { active: boolean; onSave: (a: Appointment) => void }) {
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState('');
  return (
    <form
      className={styles.root}
      aria-label="Appointment details"
      onSubmit={(e) => { e.preventDefault(); if (active && date) onSave({ provider: provider.trim(), date }); }}
    >
      <Input label="Provider name" placeholder="e.g. Dr. Patel" value={provider} autoCapitalize="words" disabled={!active} onChange={(e) => setProvider(e.target.value)} />
      <Input label="Appointment date" type="date" value={date} disabled={!active} onChange={(e) => setDate(e.target.value)} />
      {active && <Button type="submit" fullWidth disabled={!date}>Save appointment</Button>}
    </form>
  );
}
