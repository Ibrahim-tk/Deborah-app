/** @shell StatusBar — live 12-h clock (simulated time), signal, Wi-Fi and battery glyphs. Colour follows the screen. */
import { useSimClock } from '../useSimClock';
import styles from './StatusBar.module.css';

export interface StatusBarProps {
  tone: 'dark' | 'light';
}

export function StatusBar({ tone }: StatusBarProps) {
  const time = useSimClock();
  return (
    <div className={styles.root} data-tone={tone} aria-hidden="true">
      <span className={styles.time}>{time}</span>
      <span className={styles.glyphs}>
        <svg width="18" height="12" viewBox="0 0 18 12">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 1 10.2 10.2 0 0 0 .9 3.8L2 5c1.6-1.5 3.7-2.4 6-2.4Z" />
          <path d="M8 6c1.4 0 2.7.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8 4.3a6.8 6.8 0 0 0-4.8 1.9l1.2 1.2C5.3 6.5 6.6 6 8 6Z" />
          <path d="M8 9.3c.6 0 1.1.2 1.5.6L8 11.5 6.5 9.9c.4-.4.9-.6 1.5-.6Z" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2" />
          <path d="M25 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2Z" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}
