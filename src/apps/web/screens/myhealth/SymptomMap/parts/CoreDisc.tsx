/**
 * The common denominator. Centre of the overview ring; sinks away when an area is zoomed;
 * rises into the hero slot for the core view (its words fade, the glyph takes over and its name sits below).
 */
import type { SymptomMapCore } from '@shared/types/health';
import { Icon, MotionButton, MotionSpan, useTransform, type MotionValue } from '@web/ui';
import { CENTER_Y, CORE_HERO, CORE_Y, HERO_X } from './geometry';
import styles from './Wheel.module.css';

const SIZE = 92;

interface Props {
  core: SymptomMapCore;
  zoom: MotionValue<number>;
  coreZ: MotionValue<number>;
  onPress: () => void;
}

export function CoreDisc({ core, zoom, coreZ, onPress }: Props) {
  const y = useTransform([zoom, coreZ], ([z, c]: number[]) => CENTER_Y + z * (1 - c) * 120 + (CORE_Y - CENTER_Y) * c);
  // Web C-wheel: in the core view the core moves to the C's left-middle slot.
  const x = useTransform(coreZ, (c) => HERO_X * c);
  const scale = useTransform([zoom, coreZ], ([z, c]: number[]) => (1 - 0.4 * z) * (1 - c) + (CORE_HERO / SIZE) * c);
  const opacity = useTransform([zoom, coreZ], ([z, c]: number[]) => Math.max(1 - z * 1.6, c));
  const words = useTransform(coreZ, [0, 0.4], [1, 0]);
  const glyph = useTransform(coreZ, [0.5, 1], [0, 1]);
  const events = useTransform(opacity, (o) => (o < 0.5 ? 'none' : 'auto'));
  // Core view: its name sits just below the circle, at a steady 15px.
  const nameScale = useTransform(scale, (s) => 1 / s);

  return (
    <MotionButton
      type="button"
      className={styles.core}
      style={{ x, y, scale, opacity, pointerEvents: events }}
      onClick={onPress}
      aria-label={`${core.title}: ${core.label}`}
    >
      <MotionSpan className={styles.coreWords} style={{ opacity: words }}>
        <span className={styles.coreTitle}>{core.title}</span>
      </MotionSpan>
      <MotionSpan className={styles.coreGlyph} style={{ opacity: glyph, scale: SIZE / CORE_HERO }}>
        <Icon name="hypothalamus" size={72} strokeWidth={1.1} />
      </MotionSpan>
      <MotionSpan className={styles.coreName} style={{ opacity: glyph, scale: nameScale }} aria-hidden>{core.title}</MotionSpan>
    </MotionButton>
  );
}
