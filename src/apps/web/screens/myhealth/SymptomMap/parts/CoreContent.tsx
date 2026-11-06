/** Core view reading (designer, 2026-11-07): the hypothalamus line as the big text, then the mechanisms as pills. */
import type { SymptomMapCore } from '@shared/types/health';
import styles from './Content.module.css';

interface Props {
  core: SymptomMapCore;
}

export function CoreContent({ core }: Props) {
  return (
    <>
      <h2 className={styles.question}>{core.why}</h2>
      <section className={styles.sections} aria-label="What can go off">
        <ul className={styles.pills}>
          {core.mechanism.map((m) => <li key={m} className={styles.pill}>{m}</li>)}
        </ul>
      </section>
    </>
  );
}
