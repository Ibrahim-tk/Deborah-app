/**
 * Lab values as a tile grid (design direction 2026-10-20): a heading above one container and a small tile per
 * marker (editing lives in the screen's ••• menu) — name on top, value centred, unit and plain-text status under it.
 * No pills or badges (DESIGN.md): status is coloured text only.
 */
import type { LabValue } from '@shared/types/domain';
import styles from './LabValueGrid.module.css';

export interface LabValueGridProps {
  title: string;
  values: LabValue[];
}

export function LabValueGrid({ title, values }: LabValueGridProps) {
  return (
    <section className={styles.root} aria-labelledby="lab-values-title">
      <div className={styles.head}>
        <h2 id="lab-values-title" className={styles.title}>{title}</h2>
      </div>
      <div className={styles.box}>
        <ul className={styles.grid}>
          {values.map((v) => (
            <li key={v.id} className={styles.tile}>
              <span className={styles.marker}>{v.marker}</span>
              {/* Number and unit on one line; words (e.g. Non-Reactive) set smaller so they never break. */}
              <span className={styles.reading}>
                <span className={styles.value} data-tone={v.statusTone} data-words={!/\d/.test(v.value) || undefined}>{v.value}</span>
                {v.unit.trim() && <span className={styles.unit}>{v.unit}</span>}
              </span>
              <span className={styles.status} data-tone={v.statusTone}>{v.statusLabel ?? ''}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
