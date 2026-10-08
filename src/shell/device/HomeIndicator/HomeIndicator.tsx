/** @shell HomeIndicator — 134 × 5 bar, 8 px from the bottom. */
import styles from './HomeIndicator.module.css';

export interface HomeIndicatorProps {
  tone: 'dark' | 'light';
}

export function HomeIndicator({ tone }: HomeIndicatorProps) {
  return <div className={styles.root} data-tone={tone} aria-hidden="true" />;
}
