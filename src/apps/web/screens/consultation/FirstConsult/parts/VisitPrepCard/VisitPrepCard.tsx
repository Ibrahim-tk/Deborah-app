/**
 * "For my next appointment": the answer's provider questions and tests on one card, ready to share or save.
 * Layout (design direction 2026-10-14): numbered questions and tests as compact rows split by hairlines;
 * each test shows its name first and the reason under it in secondary text.
 */
import { Button, Card, Icon } from '@web/ui';
import styles from './VisitPrepCard.module.css';

export interface VisitPrepCardProps {
  title: string;
  questions: string[];
  tests: string[];
  onShare: () => void;
  onSave: () => void;
}

/** "TSH, free T4: Shows if…" → name and reason. */
const splitTest = (t: string) => {
  const at = t.indexOf(': ');
  return at < 0 ? { name: t, why: '' } : { name: t.slice(0, at), why: t.slice(at + 2) };
};

export function VisitPrepCard({ title, questions, tests, onShare, onSave }: VisitPrepCardProps) {
  return (
    <Card className={styles.root}>
      <div className={styles.head}>
        <Icon name="note" size={16} />
        <h3 className={styles.title}>{title}</h3>
      </div>
      <section className={styles.group}>
        <h4 className={styles.label}>Questions to ask</h4>
        <ol className={styles.list}>
          {questions.map((q, i) => (
            <li key={q} className={styles.row}>
              <span className={styles.num} aria-hidden>{i + 1}</span>
              <span className={styles.question}>{q}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.group}>
        <h4 className={styles.label}>Tests worth discussing</h4>
        <ul className={styles.list}>
          {tests.map((t, i) => {
            const { name, why } = splitTest(t);
            return (
              <li key={t} className={styles.row}>
                <span className={styles.num} aria-hidden>{i + 1}</span>
                <span className={styles.text}>
                  <span className={styles.name}>{name}</span>
                  {why && <span className={styles.why}>{why}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <div className={styles.actions}>
        <Button size="md" fullWidth leadingIcon="share" className={styles.share} onClick={onShare}>Share PDF</Button>
        {/* Save is an icon: the heart is the app's "My Health" mark. */}
        <button type="button" className={styles.save} aria-label="Save to My Health" title="Save to My Health" onClick={onSave}>
          <Icon name="health" size={20} />
        </button>
      </div>
    </Card>
  );
}
