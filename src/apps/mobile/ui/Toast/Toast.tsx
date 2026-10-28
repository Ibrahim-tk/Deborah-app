/** @ui Toast — cream canvas pill, ink text, full-round, hairline + float shadow; optional leading icon.
 *  Presentational; the app owns timing (design 2026-10-20). */
import { Icon, type IconName } from '../Icon';
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
  icon?: IconName;
}

export function Toast({ message, icon }: ToastProps) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      {icon && <Icon name={icon} size={16} className={styles.icon} />}
      <span>{message}</span>
    </div>
  );
}
