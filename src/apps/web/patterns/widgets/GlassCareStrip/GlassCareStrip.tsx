/**
 * GlassCareStrip — compact frosted chips for intake / plan / reports on Home.
 */
import styles from './GlassCareStrip.module.css';

export interface CareChip {
  key: string;
  label: string;
  meta?: string;
  onPress: () => void;
}

export function GlassCareStrip({ items }: { items: CareChip[] }) {
  if (!items.length) return null;
  return (
    <ul className={styles.strip} aria-label="Care shortcuts">
      {items.map((item) => (
        <li key={item.key}>
          <button type="button" className={styles.chip} onClick={item.onPress}>
            <span className={styles.dot} aria-hidden />
            <span className={styles.label}>{item.label}</span>
            {item.meta && <span className={styles.meta}>{item.meta}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
