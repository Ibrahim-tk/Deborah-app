/** Elevation — shadows that float only. Values read live from .phone-root. */
import type { CSSProperties } from 'react';
import { Section, Group } from '../Section';
import { useTokenReader } from '../live';
import { SHADOWS } from '../catalog';
import styles from './sections.module.css';

const v = (name: string, value: string) => ({ [name]: value }) as CSSProperties;

export function Depth() {
  const read = useTokenReader();
  return (
    <Section id="depth" title="Depth" lede="Only floating chrome casts shadows — composer, sheets, menus, toasts. Content that scrolls with the page stays flat.">
      <Group title="Elevation">
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
