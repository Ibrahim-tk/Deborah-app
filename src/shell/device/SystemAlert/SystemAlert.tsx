/** @shell SystemAlert — iOS-style centred alert, requested via useDevice().alert() (docs/03 §3). */
import type { DeviceAlertOptions } from '../useDevice';
import styles from './SystemAlert.module.css';

export interface SystemAlertProps {
  options: DeviceAlertOptions;
  onChoose: (index: number) => void;
}

export function SystemAlert({ options, onChoose }: SystemAlertProps) {
  const stacked = options.buttons.length > 2;
  return (
    <div className={styles.root}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-label={options.title}>
        <div className={styles.text}>
          <p className={styles.title}>{options.title}</p>
          {options.message && <p className={styles.message}>{options.message}</p>}
        </div>
        <div className={styles.buttons} data-stacked={stacked || undefined}>
          {options.buttons.map((b, i) => (
            <button key={b.label} type="button" className={styles.button} data-style={b.style ?? 'default'} onClick={() => onChoose(i)} autoFocus={i === options.buttons.length - 1}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
