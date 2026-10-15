/** Spacing, layout sizes, radius and elevation — all read live. */
import type { CSSProperties } from 'react';
import { Section, Group } from '../Section';
import { useTokenReader } from '../live';
import { LAYOUT, RADII, SHADOWS, SPACE } from '../catalog';
import styles from './sections.module.css';

const v = (name: string, value: string) => ({ [name]: value }) as CSSProperties;

export function SpaceShape() {
  const read = useTokenReader();
  return (
    <Section id="space" title="Space, shape and depth" lede="A 4-pt spacing scale, soft rounded geometry and flat tonal layering. Shadows belong only to things that float.">
      <Group title="Spacing" note="Tight groups 8–12 · between components 16–24 · between sections 32–40.">
        <div className={styles.spaceList}>
          {SPACE.map((t) => (
            <div key={t} className={styles.spaceRow}>
              <span className={styles.mono}>{t}</span>
              <span className={styles.monoMuted}>{read(t)}</span>
              <span className={styles.spaceBar} style={v('--w', read(t))} />
            </div>
          ))}
        </div>
      </Group>

      <Group title="Layout sizes" note="Touch targets never drop below 48 pt; rows below 56 pt. Device frame 393 × 852 pt.">
        <div className={styles.swatches}>
          {LAYOUT.map((t) => (
            <div key={t.name} className={styles.swatch}>
              <span className={styles.sizeValue}>{read(t.name)}</span>
              <span className={styles.mono}>{t.name}</span>
              <span className={styles.swatchUse}>{t.use}</span>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Radius" note="No pills, tags or badges: fully round shapes are reserved for buttons, avatars, the tab bar and switches.">
        <div className={styles.swatches}>
          {RADII.map((t) => (
            <div key={t.name} className={styles.swatch}>
              <span className={styles.radiusBox} style={v('--r', read(t.name))} />
              <span className={styles.mono}>{t.name}</span>
              <span className={styles.monoMuted}>{read(t.name)}</span>
              <span className={styles.swatchUse}>{t.use}</span>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Elevation" note="Only floating elements cast shadows. If it scrolls with the content, it is flat.">
        <div className={styles.shadowStage}>
          {SHADOWS.map((t) => (
            <div key={t.name} className={styles.shadowItem}>
              <span className={styles.shadowBox} style={v('--s', read(t.name))} />
              <span className={styles.mono}>{t.name}</span>
              <span className={styles.swatchUse}>{t.use}</span>
            </div>
          ))}
        </div>
      </Group>
    </Section>
  );
}
