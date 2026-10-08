/** @ui Toast — Midnight surface, Parchment callout text, lg radius, float-sm. Presentational; ToastHost owns timing. @xref mobile: apps/mobile/ui/Toast */
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return <div className={styles.root}>{message}</div>;
}
