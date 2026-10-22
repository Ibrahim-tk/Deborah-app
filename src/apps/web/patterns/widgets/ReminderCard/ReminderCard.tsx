/**
 * @pattern ReminderCard — offer a gentle reminder in the chat: what, when, and an on/off switch.
 * @usedBy  widget lab (/wid)
 */
import { useState } from 'react';
import { Icon, Toggle } from '@web/ui';
import styles from './ReminderCard.module.css';

export interface ReminderCardProps {
  what: string;
  when: string;
  onChange: (on: boolean) => void;
}

export function ReminderCard({ what, when, onChange }: ReminderCardProps) {
  const [on, setOn] = useState(false);
  return (
    <section className={styles.root} aria-label="Reminder">
      <p className={styles.eyebrow}><Icon name="bell" size={16} /> Reminder</p>
      <Toggle checked={on} label={what} description={when} onChange={(v) => { setOn(v); onChange(v); }} />
    </section>
  );
}
