/** @ui Toast — presentational confirmation; the app owns timing (one at a time, 2.5 s). */
import { Icon } from '../Icon';
import styles from './Toast.module.css';

export function Toast({ message }: { message: string }) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <Icon name="check" size={18} className={styles.icon} />
      <span>{message}</span>
    </div>
  );
}
