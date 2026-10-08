/**
 * @pattern EmergencyInterrupt — strongest emphasis in the system; Call 911 is the largest button
 * @usedBy  M-2.1
 * @spec    docs/ux/F03-safety.md#pattern--emergencyinterrupt-figma-31
 * @xref    web: apps/web/patterns/safety/EmergencyInterrupt — not built
 */
import { Button, Icon } from '@mobile/ui';
import styles from './EmergencyInterrupt.module.css';

export interface EmergencyInterruptProps {
  title: string;
  body: string;
  acknowledged?: boolean;
  onCall: () => void;
  onFindER: () => void;
  onSafe: () => void;
}

export function EmergencyInterrupt({ title, body, acknowledged, onCall, onFindER, onSafe }: EmergencyInterruptProps) {
  if (acknowledged) {
    return (
      <p className={styles.compact}>
        <Icon name="alert" size={20} /> Emergency guidance shown
      </p>
    );
  }
  return (
    <div className={styles.root} role="alert" data-placeholder>
      <div className={styles.head}>
        <Icon name="alert" size={28} className={styles.icon} />
        <h2 className={styles.title}>{title}</h2>
      </div>
      <p className={styles.body}>{body}</p>
      <Button variant="emergency" fullWidth leadingIcon="phone" onClick={onCall}>Call 911</Button>
      <Button variant="secondary" fullWidth leadingIcon="location" onClick={onFindER}>Find nearest ER</Button>
      <Button variant="ghost" fullWidth onClick={onSafe}>I’m safe — this isn’t happening now</Button>
    </div>
  );
}
