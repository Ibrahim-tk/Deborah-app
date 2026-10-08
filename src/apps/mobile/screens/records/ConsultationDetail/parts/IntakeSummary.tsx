/** Collapsed intake line ("Intake: 46–50 · None · Irregular"); tap to show each question and answer. */
import { useId, useState } from 'react';
import { cx } from '@shared/utils';
import { Icon } from '@mobile/ui';
import { intakeSummary, type IntakePair } from './transcriptModel';
import styles from './Transcript.module.css';

export function IntakeSummary({ pairs }: { pairs: IntakePair[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={styles.intake}>
      <button type="button" className={styles.intakeToggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className={styles.intakeLine}>{intakeSummary(pairs)}</span>
        <Icon name="chevronDown" size={20} className={cx(styles.chevron, open && styles.chevronOpen)} />
      </button>
      {open && (
        <dl id={id} className={styles.pairs}>
          {pairs.map((p) => (
            <div key={p.id} className={styles.pair}>
              <dt className={styles.question}>{p.question}</dt>
              <dd className={styles.answer}>{p.answer}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
