/** "Questions for my visit": each non-empty line of the body previewed as a checklist item. */
import styles from '../NoteEditor.module.css';

// ASSUMPTION: the checklist is a read-only preview under the text area (boxes are not tappable);
// ticking questions off during a visit is not specified.
export function ChecklistPreview({ body }: { body: string }) {
  const lines = body
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <section className={styles.checklist} aria-label="Checklist preview">
      <h2 className={styles.label}>For your visit</h2>
      <ul className={styles.items}>
        {lines.map((l, i) => (
          <li key={`${i}-${l}`} className={styles.item}>
            <span className={styles.box} aria-hidden />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
