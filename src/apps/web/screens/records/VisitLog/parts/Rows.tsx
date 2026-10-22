/**
 * Visit log building blocks. Repeating items (labs, changes, next steps) read like the medicine list:
 * one white card of rows (title · detail · grey delete); "+" in the section header adds, a tap on a row edits.
 * Both open a bottom sheet with full-width fields.
 */
import { useState, type ReactNode } from 'react';
import { BottomSheet, Button, Icon, IconButton, TextArea } from '@web/ui';
import styles from '../VisitLog.module.css';

export function ItemList<T>({ n, title, addLabel = 'Add', items, blank, summary, fields, onChange, children }: {
  /** Dashed empty-state button, e.g. "Add lab". */
  addLabel?: string;
  /** Section number and heading: the list is its own section, "+" sits on the heading. */
  n: string;
  title: string;
  children?: ReactNode;
  items: T[];
  blank: () => T;
  summary: (item: T) => { title: string; detail?: string };
  /** Fields for the sheet, editing a draft copy. */
  fields: (draft: T, set: (patch: Partial<T>) => void) => ReactNode;
  onChange: (items: T[]) => void;
}) {
  const [editing, setEditing] = useState<{ index: number; draft: T } | null>(null);
  const close = () => setEditing(null);
  const add = () => setEditing({ index: -1, draft: blank() });
  const save = () => {
    if (!editing) return;
    onChange(editing.index < 0 ? [...items, editing.draft] : items.map((x, i) => (i === editing.index ? editing.draft : x)));
    close();
  };
  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.headRow}>
        <h2 className={styles.sectionTitle}><span className={styles.num}>{n}</span>{title}</h2>
        {/* "+" on the heading only once something is added; empty sections get the dashed add button. */}
        {items.length > 0 && <IconButton icon="plus" size="sm" label={`Add to ${title.toLowerCase()}`} onClick={add} />}
      </div>
      {items.length > 0 ? (
        <ul className={styles.tiles}>
          {items.map((it, i) => {
            const s = summary(it);
            return (
              <li key={i} className={styles.tile}>
                <button type="button" className={styles.tileMain} onClick={() => setEditing({ index: i, draft: it })}>
                  <span className={styles.tileTitle}>{s.title || 'Untitled'}</span>
                  {s.detail && <span className={styles.tileDetail}>{s.detail}</span>}
                </button>
                <IconButton icon="delete" size="sm" className={styles.remove} label={`Remove ${s.title}`} onClick={() => onChange(items.filter((_, j) => j !== i))} />
              </li>
            );
          })}
        </ul>
      ) : (
        <button type="button" className={styles.dashed} onClick={add}><Icon name="plus" size={16} /> {addLabel}</button>
      )}
      <BottomSheet open={Boolean(editing)} onClose={close} showClose title={editing && editing.index >= 0 ? `Edit ${title.toLowerCase()}` : `Add to ${title.toLowerCase()}`}
        footer={<Button fullWidth onClick={save}>Save</Button>}>
        {editing && <div className={styles.sheetFields}>{fields(editing.draft, (p) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...p } } : e)))}</div>}
      </BottomSheet>
      {children}
    </section>
  );
}

export function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className={styles.section} aria-label={title}>
      <h2 className={styles.sectionTitle}><span className={styles.num}>{n}</span>{title}</h2>
      <div className={styles.fields}>{children}</div>
    </section>
  );
}

/** Labelled multi-line field in the same look as ui/Input (ui/TextArea is bare). */
export function Area({ label, ...rest }: { label: string; value: string; onChange: (e: { target: { value: string } }) => void; minRows?: number; placeholder?: string }) {
  return (
    <label className={styles.area}>
      <span className={styles.areaLabel}>{label}</span>
      <TextArea label={label} className={styles.areaBox} {...rest} />
    </label>
  );
}
