/** "For my next appointment": the answer's provider questions and tests on one card, ready to share or save. */
import { Button, Card, Icon } from '@mobile/ui';
import styles from './VisitPrepCard.module.css';

export interface VisitPrepCardProps {
  title: string;
  questions: string[];
  tests: string[];
  onShare: () => void;
  onSave: () => void;
}

export function VisitPrepCard({ title, questions, tests, onShare, onSave }: VisitPrepCardProps) {
  return (
    <Card className={styles.root}>
      <div className={styles.head}>
        <Icon name="note" size={22} />
        <h3 className={styles.title}>{title}</h3>
      </div>
      <section className={styles.group}>
        <h4 className={styles.label}>Questions to ask</h4>
        <ol className={styles.list}>{questions.map((q) => <li key={q}>{q}</li>)}</ol>
      </section>
      <section className={styles.group}>
        <h4 className={styles.label}>Tests worth discussing</h4>
        <ul className={styles.list}>{tests.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>
      <div className={styles.actions}>
        <Button fullWidth leadingIcon="share" onClick={onShare}>Share as PDF</Button>
        <Button variant="secondary" fullWidth leadingIcon="health" onClick={onSave}>Save to My Health</Button>
      </div>
    </Card>
  );
}
