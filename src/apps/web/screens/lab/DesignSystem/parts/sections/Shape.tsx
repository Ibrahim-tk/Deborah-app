/** Radius tokens — values read live from .phone-root. */
import type { CSSProperties } from 'react';
import { Section, Group } from '../Section';
import { useTokenReader } from '../live';
import { RADII } from '../catalog';
import styles from './sections.module.css';

const v = (name: string, value: string) => ({ [name]: value }) as CSSProperties;

export function Shape() {
  const read = useTokenReader();
  return (
    <Section id="shape" title="Shape" lede="Corner radii used by V2 controls. Fully round shapes stay on buttons, avatars, the tab bar and switches.">
      <Group title="Radius">
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
    </Section>
  );
}
