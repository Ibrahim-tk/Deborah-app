/**
 * Generative appointment form (design 2026-10-21): after "Yes, I have an appointment", one small card with
 * the provider's name and the date, and a small Save at the bottom right (2026-10-21). Nothing else.
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { dayKey, nowFrom } from '@shared/utils';
import { BottomSheet, Button, CalendarGrid, Icon, Input } from '@web/ui';
import styles from './AppointmentForm.module.css';

export interface Appointment {
  provider: string;
  /** yyyy-mm-dd from the date field. */
  date: string;
}

export function AppointmentForm({ active, onSave }: { active: boolean; onSave: (a: Appointment) => void }) {
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState('');
  const [picking, setPicking] = useState(false);
  // Today from the simulated clock; appointments are today or later.
  const today = dayKey(nowFrom(useAppStore.getState()));
  const shown = date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return (
    <form
      className={styles.root}
      aria-label="Appointment details"
      onSubmit={(e) => { e.preventDefault(); if (active && date) onSave({ provider: provider.trim(), date }); }}
    >
      <Input label="Provider name" placeholder="e.g. Dr. Patel" value={provider} autoCapitalize="words" disabled={!active} onChange={(e) => setProvider(e.target.value)} />
      {/* Date field opens CalendarGrid in BottomSheet (overlay), not inline. */}
      <div className={styles.dateField}>
        <span className={styles.dateLabel} id="appt-date-label">Appointment date</span>
        <button type="button" className={styles.dateButton} aria-labelledby="appt-date-label" aria-expanded={picking} disabled={!active} onClick={() => setPicking(true)}>
          <span data-empty={!date || undefined}>{shown || 'Pick a date'}</span>
          <Icon name="calendar" size={18} />
        </button>
      </div>
      <BottomSheet
        open={picking && active}
        onClose={() => setPicking(false)}
        showClose
        title="Appointment date"
        footer={<Button fullWidth onClick={() => setPicking(false)}>Done</Button>}
      >
        <div className={styles.calendar}>
          <CalendarGrid value={date || undefined} today={today} min={today} onChange={(v) => { setDate(v); setPicking(false); }} />
        </div>
      </BottomSheet>
      {active && <Button type="submit" size="sm" className={styles.save} disabled={!date}>Save</Button>}
    </form>
  );
}
