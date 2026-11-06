/**
 * One wheel disc. Place, size and fade come from the wheel's motion values every frame
 * (no React render): small on the overview ring, swelling into the hero at the top when zoomed.
 */
import { cx } from '@shared/utils';
import type { SymptomMapDomain } from '@shared/types/health';
import { Icon, MotionButton, MotionSpan, useTransform, type IconName, type MotionValue } from '@mobile/ui';
import { wheelLayout } from './geometry';
import styles from './Wheel.module.css';

const ICON_MAX = 72;

interface Props {
  domain: SymptomMapDomain;
  index: number;
  strength: 0 | 1 | 2;
  rotation: MotionValue<number>;
  zoom: MotionValue<number>;
  coreZ: MotionValue<number>;
  width: MotionValue<number>;
  /** Reachable by keyboard / screen reader (overview, or the hero and its neighbours). */
  reachable: boolean;
  /** Overview tone: `quiet` (none of the person's symptoms) · `dim` (off the traced symptom). */
  tone?: 'quiet' | 'dim';
  onPress: (index: number) => void;
}

export function AreaDisc({ domain, index, strength, rotation, zoom, coreZ, width, reachable, tone, onPress }: Props) {
  const layout = useTransform([rotation, zoom, coreZ, width], ([r, z, c, w]: number[]) => wheelLayout(index, r, z, w, strength, c));
  const x = useTransform(layout, (l) => l.x);
  const y = useTransform(layout, (l) => l.y);
  const scale = useTransform(layout, (l) => l.scale);
  const opacity = useTransform(layout, (l) => l.opacity);
  const zIndex = useTransform(layout, (l) => l.z);
  const label = useTransform(layout, (l) => l.label);
  // Icon centred in the disc, name below it outside the circle (designer reference, 2026-11-07).
  const labelScale = useTransform(layout, (l) => l.labelScale);
  const hero = useTransform(layout, (l) => l.hero);
  const heroScale = useTransform(layout, (l) => l.heroScale);
  // Glyph is drawn at its largest (hero) size and only ever scaled down, so it stays crisp;
  // the counter-scale lands it at its own size, not the disc's.
  const iconScale = useTransform(layout, (l) => l.icon / ICON_MAX / l.scale);
  const events = useTransform(opacity, (o) => (o < 0.05 ? 'none' : 'auto'));

  return (
    <MotionButton
      type="button"
      className={cx(styles.disc, strength > 0 && styles.matched, strength === 2 && styles.strong, tone && styles[tone])}
      style={{ x, y, scale, opacity, zIndex, pointerEvents: events }}
      data-hue={index}
      aria-label={domain.title}
      aria-hidden={!reachable || undefined}
      tabIndex={reachable ? 0 : -1}
      onClick={() => onPress(index)}
    >
      <MotionSpan className={styles.glyph} style={{ scale: iconScale }}>
        <Icon name={domain.icon as IconName} size={ICON_MAX} />
      </MotionSpan>
      <MotionSpan className={styles.label} style={{ opacity: label, scale: labelScale }}>{domain.short}</MotionSpan>
      <MotionSpan className={styles.innerLabel} style={{ opacity: hero, scale: heroScale }} aria-hidden>{domain.short}</MotionSpan>
    </MotionButton>
  );
}
