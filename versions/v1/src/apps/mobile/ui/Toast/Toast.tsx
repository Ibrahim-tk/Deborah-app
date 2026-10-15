/** @ui Toast — Midnight surface, Parchment callout text, lg radius, float-sm. Presentational; the app owns timing. */
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      {message}
    </div>
  );
}
