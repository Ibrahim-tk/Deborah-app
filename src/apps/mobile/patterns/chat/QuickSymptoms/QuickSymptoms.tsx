/**
 * @pattern QuickSymptoms — small label + one horizontal row of symptom pills on the empty chat (designer, 2026-10-28).
 *          Picks become composer tokens (same as SymptomPicker); "Something else" opens the full sheet.
 * @usedBy  M-2.1 Conversation (empty)
 * @xref    web: apps/web/patterns/chat/QuickSymptoms
 */
import { QUICK_SYMPTOMS, QUICK_SYMPTOMS_LABEL, QUICK_SYMPTOMS_MORE } from '@shared/copy/quickSymptoms';
import styles from './QuickSymptoms.module.css';

export interface QuickSymptomsProps {
  selected: string[];
  onToggle: (symptom: string) => void;
  onMore: () => void;
}

export function QuickSymptoms({ selected, onToggle, onMore }: QuickSymptomsProps) {
  return (
    <section className={styles.root} aria-labelledby="quick-symptoms-label">
      <p id="quick-symptoms-label" className={styles.label}>{QUICK_SYMPTOMS_LABEL}</p>
      <ul className={styles.list}>
        {QUICK_SYMPTOMS.map((s) => (
          <li key={s}>
            <button type="button" className={styles.pill} aria-pressed={selected.includes(s)} onClick={() => onToggle(s)}>{s}</button>
          </li>
        ))}
        <li>
          <button type="button" className={styles.pill} onClick={onMore}>{QUICK_SYMPTOMS_MORE}</button>
        </li>
      </ul>
    </section>
  );
}
