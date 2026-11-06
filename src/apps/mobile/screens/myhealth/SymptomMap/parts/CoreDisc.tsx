/**
 * The common denominator. Centre of the overview ring; sinks away when an area is zoomed;
 * rises into the hero slot for the core view (its words fade, the target glyph takes over).
 */
import type { SymptomMapCore } from '@shared/types/health';
import { Icon, MotionButton, MotionSpan, useTransform, type MotionValue } from '@mobile/ui';
import { CENTER_Y, HERO, HERO_Y } from './geometry';
import styles from './Wheel.module.css';

const SIZE = 116;

interface Props {
  core: SymptomMapCore;
  zoom: MotionValue<number>;
  coreZ: MotionValue<number>;
  onPress: () => void;
}

export function CoreDisc({ core, zoom, coreZ, onPress }: Props) {
  const y = useTransform([zoom, coreZ], ([z, c]: number[]) => CENTER_Y + z * (1 - c) * 120 + (HERO_Y - CENTER_Y) * c);
  const scale = useTransform([zoom, coreZ], ([z, c]: number[]) => (1 - 0.4 * z) * (1 - c) + (HERO / SIZE) * c);
  const opacity = useTransform([zoom, coreZ], ([z, c]: number[]) => Math.max(1 - z * 1.6, c));
  const words = useTransform(coreZ, [0, 0.4], [1, 0]);
  const glyph = useTransform(coreZ, [0.5, 1], [0, 1]);
  const events = useTransform(opacity, (o) => (o < 0.5 ? 'none' : 'auto'));

  return (
    <MotionButton
      type="button"
      className={styles.core}
      style={{ y, scale, opacity, pointerEvents: events }}
      onClick={onPress}
      aria-label={`${core.title}: ${core.label}`}
    >
      <MotionSpan className={styles.coreWords} style={{ opacity: words }}>
        <span className={styles.coreTitle}>{core.title}</span>
      </MotionSpan>
      <MotionSpan className={styles.coreGlyph} style={{ opacity: glyph, scale: SIZE / HERO }}>
        <Icon name="target" size={72} strokeWidth={1.1} />
      </MotionSpan>
    </MotionButton>
  );
}
