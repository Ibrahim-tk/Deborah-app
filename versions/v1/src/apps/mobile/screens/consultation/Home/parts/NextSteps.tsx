/**
 * Home (returning): next steps pulled from the last chat (Deborah's follow-up questions), and
 * personalised recommendations with a "Because you mentioned…" line. Rows, not chips (DESIGN.md).
 */
import { OptionRow } from '@flow-v1/apps/mobile/ui';
import styles from './HomeCards.module.css';

export function NextSteps({ steps, onPick }: { steps: string[]; onPick: (s: string) => void }) {
  if (!steps.length) return null;
  return (
    <section className={styles.steps} aria-labelledby="next-steps">
      <h2 id="next-steps" className={styles.label}>Next steps</h2>
      {steps.map((s) => (
        <OptionRow key={s} chevron className={styles.slimRow} onSelect={() => onPick(s)}>{s}</OptionRow>
      ))}
    </section>
  );
}

export function BecauseLine({ topic }: { topic: string }) {
  return <p className={styles.because}>Because you mentioned {topic.toLowerCase()}</p>;
}
