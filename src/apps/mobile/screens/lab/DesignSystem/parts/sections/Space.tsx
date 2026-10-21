/** Spacing and layout sizes — values read live from .phone-root. */
import type { CSSProperties } from 'react';
import { Section, Group } from '../Section';
import { useTokenReader } from '../live';
import { LAYOUT, SPACE } from '../catalog';
import styles from './sections.module.css';

const v = (name: string, value: string) => ({ [name]: value }) as CSSProperties;

export function Space() {
  const read = useTokenReader();
  return (
    <Section id="space" title="Space" lede="Live spacing and layout sizes from the phone skin. What you see here is what V2 screens use today.">
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

      <Group title="Layout sizes" note="Touch targets and chrome heights as computed on .phone-root.">
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
    </Section>
  );
}
