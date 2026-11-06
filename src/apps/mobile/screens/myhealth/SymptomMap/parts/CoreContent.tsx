/** Core view reading: why one root shows up in many places, the mechanisms, and the person's areas. */
import type { SymptomMapCore, SymptomMapDomain } from '@shared/types/health';
import styles from './Content.module.css';

interface Props {
  core: SymptomMapCore;
  yourAreas: SymptomMapDomain[];
  onJump: (domainId: string) => void;
}

export function CoreContent({ core, yourAreas, onJump }: Props) {
  return (
    <>
      <h2 className={styles.title}>{core.title}</h2>
      <p className={styles.kicker}>{core.label}</p>
      <p className={styles.why}>{core.why}</p>
      <ul className={styles.list}>
        {core.mechanism.map((m) => <li key={m}>{m}</li>)}
      </ul>
      {yourAreas.length > 0 && (
        <div className={styles.group}>
          <p className={styles.note}>Your areas</p>
          <div className={styles.links}>
            {yourAreas.map((d) => (
              <button key={d.id} type="button" className={styles.link} onClick={() => onJump(d.id)}>{d.short}</button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
