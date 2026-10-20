/** After save/download: ask if an appointment date is known (Miro Step 5 exit). */
import { useState } from 'react';
import { Button, DateWheel } from '@mobile/ui';

const YEAR = new Date().getFullYear();
import styles from './AppointmentFollowUp.module.css';

export interface AppointmentFollowUpProps {
  onWithDate: (isoDate: string) => void;
  onWithoutDate: () => void;
}

export function AppointmentFollowUp({ onWithDate, onWithoutDate }: AppointmentFollowUpProps) {
  const [asking, setAsking] = useState(false);
  // Starts on today, so the wheel is already set and Set check-in is ready.
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  if (!asking) {
    return (
      <div className={styles.panel} role="group" aria-label="Appointment follow-up">
        <p className={styles.q}>We’ll check in after your visit.</p>
        <div className={styles.row}>
          <Button variant="secondary" fullWidth onClick={() => setAsking(true)}>Yes</Button>
          <Button variant="secondary" fullWidth onClick={onWithoutDate}>No</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel} role="group" aria-label="Appointment date">
      {/* The date wheel opens straight away (design 2026-10-20) — no native date popup. */}
      <DateWheel label="Appointment date" value={date} minYear={YEAR} maxYear={YEAR + 2} onChange={setDate} />
      <div className={styles.row}>
        <Button variant="ghost" fullWidth onClick={() => setAsking(false)}>Back</Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!date}
          onClick={() => {
            // Store as noon local ISO so day-after math is stable across timezones in the prototype.
            const iso = new Date(`${date}T12:00:00`).toISOString();
            onWithDate(iso);
          }}
        >
          Set check-in
        </Button>
      </div>
    </div>
  );
}
