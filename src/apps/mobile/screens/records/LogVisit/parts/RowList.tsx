/** M-9.8 editable list section: a name per row, an optional choice (status / change) and note, add / remove. */
import { Button, Checkbox, IconButton, Input, Select } from '@mobile/ui';
import { IntakeSectionHeader } from '@mobile/patterns/widgets';
import styles from '../LogVisit.module.css';

export interface RowListProps<I, C extends string> {
  title: string;
  addLabel: string;
  items: I[];
  nameLabel: string;
  name: (item: I) => string;
  choice?: { label: string; options: { value: C; label: string }[]; value: (item: I) => C };
  note?: { label: string; value: (item: I) => string };
  toggle?: { label: string; value: (item: I) => boolean; onToggle: (i: number) => void };
  lowConfidence?: boolean;
  onAdd: () => void;
  onChange: (i: number, name: string, choice?: C, note?: string) => void;
  onRemove: (i: number) => void;
}

export function RowList<I, C extends string>({ title, addLabel, items, nameLabel, name, choice, note, toggle, lowConfidence, onAdd, onChange, onRemove }: RowListProps<I, C>) {
  return (
    <section className={styles.section}>
      <IntakeSectionHeader title={title} />
      {lowConfidence && items.length > 0 && <p className={styles.check}>Check this</p>}
      {items.map((item, i) => (
        <div key={i} className={styles.row}>
          <div className={styles.rowFields}>
            <Input label={`${nameLabel} ${i + 1}`} value={name(item)} onChange={(e) => onChange(i, e.target.value)} />
            {choice && (
              <Select label={choice.label} options={choice.options} value={choice.value(item)} onChange={(v) => onChange(i, name(item), v)} />
            )}
            {note && <Input label={note.label} value={note.value(item)} onChange={(e) => onChange(i, name(item), undefined, e.target.value)} />}
            {toggle && <Checkbox checked={toggle.value(item)} label={toggle.label} onChange={() => toggle.onToggle(i)} />}
          </div>
          <IconButton icon="close" size="sm" label={`Remove ${nameLabel.toLowerCase()} ${i + 1}`} onClick={() => onRemove(i)} />
        </div>
      ))}
      <Button variant="ghost" size="sm" leadingIcon="plus" onClick={onAdd}>{addLabel}</Button>
    </section>
  );
}
