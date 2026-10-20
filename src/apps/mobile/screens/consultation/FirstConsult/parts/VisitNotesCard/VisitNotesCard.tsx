/** Visit notes drawn inline in a premade chat: header lines, numbered sections, then save / share. */
import type { FlowNode } from '@shared/types/flow';
import { Button, Icon } from '@mobile/ui';
import styles from './VisitNotesCard.module.css';

export interface VisitNotesCardProps {
  notes: NonNullable<FlowNode['visitNotes']>;
  say: (s?: string) => string;
  onSave: () => void;
  onShare: () => void;
}

export function VisitNotesCard({ notes, say, onSave, onShare }: VisitNotesCardProps) {
  return (
    <section className={styles.root} aria-label={notes.title}>
      <p className={styles.head}><Icon name="note" size={16} />{notes.title}</p>
      <ul className={styles.meta}>{notes.meta.map((m) => <li key={m}>{say(m)}</li>)}</ul>
      {notes.sections.map((s) => (
        <div key={s.title} className={styles.section}>
          <h4 className={styles.title}>{s.title}</h4>
          {typeof s.body === 'string'
            ? <p className={styles.body}>{say(s.body)}</p>
            : <ul className={styles.list}>{s.body.map((b) => <li key={b}>{say(b)}</li>)}</ul>}
        </div>
      ))}
      <div className={styles.actions}>
        <Button fullWidth leadingIcon="note" onClick={onSave}>Save to My Visit Notes</Button>
        <Button variant="secondary" fullWidth onClick={onShare}>Share as PDF</Button>
      </div>
    </section>
  );
}
