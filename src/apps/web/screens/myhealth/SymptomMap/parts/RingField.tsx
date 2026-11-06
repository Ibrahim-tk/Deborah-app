/**
 * Overview backdrop in ring space, turned with the wheel and faded as it zooms: the soft wash.
 * A traced symptom shows by lighting its areas and greying the rest — no connecting lines (designer, 2026-11-07).
 */
import { MotionDiv, useTransform, type MotionValue } from '@web/ui';
import styles from './Wheel.module.css';

interface Props {
  rotation: MotionValue<number>;
  zoom: MotionValue<number>;
}

const SIZE = 400;
const C = SIZE / 2;

export function RingField({ rotation, zoom }: Props) {
  const opacity = useTransform(zoom, [0, 0.3], [1, 0]);

  return (
    <MotionDiv className={styles.field} style={{ rotate: rotation, opacity }} aria-hidden>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <filter id="symptom-map-soft"><feGaussianBlur stdDeviation="6" /></filter>
          <linearGradient id="symptom-map-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className={styles.ringStart} />
            <stop offset=".5" className={styles.ringMid} />
            <stop offset="1" className={styles.ringEnd} />
          </linearGradient>
        </defs>
        <circle className={styles.wash} cx={C} cy={C} r="128" stroke="url(#symptom-map-ring)" filter="url(#symptom-map-soft)" />
      </svg>
    </MotionDiv>
  );
}
