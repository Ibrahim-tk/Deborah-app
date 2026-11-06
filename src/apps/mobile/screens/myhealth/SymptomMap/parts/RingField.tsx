/**
 * Overview backdrop in ring space: the soft wash and threads from the core to every area
 * holding a reported symptom (bridge areas stronger). Drawn at rotation 0 and turned with
 * the wheel; fades out as it zooms.
 */
import { cx } from '@shared/utils';
import type { SymptomMapDomain } from '@shared/types/health';
import { MotionDiv, useTransform, type MotionValue } from '@mobile/ui';
import { angleOf, ringRadius } from './geometry';
import styles from './Wheel.module.css';

interface Props {
  domains: SymptomMapDomain[];
  strength: Record<string, 0 | 1 | 2>;
  bridgeIds: Set<string>;
  rotation: MotionValue<number>;
  zoom: MotionValue<number>;
  width: number;
  dragging: boolean;
}

const SIZE = 400;
const C = SIZE / 2;

export function RingField({ domains, strength, bridgeIds, rotation, zoom, width, dragging }: Props) {
  const opacity = useTransform(zoom, [0, 0.3], [1, 0]);
  const r = ringRadius(width);

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
        <g className={cx(styles.threads, dragging && styles.threadsHidden)}>
          {domains.map((d, i) => {
            if (!strength[d.id]) return null;
            const a = (angleOf(i, 0) * Math.PI) / 180;
            return <line key={d.id} className={cx(styles.thread, bridgeIds.has(d.id) && styles.bridge)} x1={C} y1={C} x2={C + Math.cos(a) * r} y2={C + Math.sin(a) * r} />;
          })}
        </g>
      </svg>
    </MotionDiv>
  );
}
