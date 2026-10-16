/** After save/download: ask if an appointment date is known (Miro Step 5 exit). */
import { useState } from 'react';
import { Button, Input } from '@mobile/ui';
import styles from './AppointmentFollowUp.module.css';

export interface AppointmentFollowUpProps {
  onWithDate: (isoDate: string) => void;
  onWithoutDate: () => void;
}

export function AppointmentFollowUp({ onWithDate, onWithoutDate }: AppointmentFollowUpProps) {
  const [asking, setAsking] = useState(false);
  const [date, setDate] = useState('');

  if (!asking) {
    return (
      <div className={styles.panel} role="group" aria-label="Appointment follow-up">
        <p className={styles.q}>Appointment date given?</p>
        <div className={styles.row}>
          <Button variant="secondary" fullWidth onClick={() => setAsking(true)}>Yes</Button>
          <Button variant="secondary" fullWidth onClick={onWithoutDate}>No</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel} role="group" aria-label="Appointment date">
      <Input
        label="Appointment date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
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
