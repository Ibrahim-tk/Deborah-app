/** Iconography: every name the Icon adapter maps (Hugeicons, stroke-rounded, 1.5 stroke). */
import { Icon } from '@mobile/ui';
import { Section } from '../Section';
import { Specimen } from '../Specimen';
import { ICONS } from '../catalog';
import styles from './sections.module.css';

export function Icons() {
  return (
    <Section
      id="icons"
      title="Iconography"
      lede={<>Hugeicons, stroke-rounded, 1.5 stroke, 24 pt default (22 in buttons, 26 in the tab bar). One library only, consumed through <code>ui/Icon</code>; components ask for these names, never the library.</>}
    >
      <Specimen name="Icon" path="ui/Icon" width="wide" stage="paper" note={<>Ask by name: <code>{'<Icon name="chat" />'}</code>. <code>deborah</code> renders her portrait blob.</>}>
        <div className={styles.iconGrid}>
          {ICONS.map((name) => (
            <div key={name} className={styles.iconCell}>
              <Icon name={name} size={24} />
              <span className={styles.monoMuted}>{name}</span>
            </div>
          ))}
        </div>
      </Specimen>
    </Section>
  );
}
