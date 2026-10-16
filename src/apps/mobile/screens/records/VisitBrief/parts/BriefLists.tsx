/**
 * Editable labs / questions / medications for M-9.7 review mode (Phase 2).
 */
import type { VisitBriefContent, VisitBriefLab, VisitBriefMed, VisitBriefQuestion } from '@shared/types/domain';
import { Button } from '@mobile/ui';
import styles from './BriefDocument.module.css';

export interface BriefListsProps {
  brief: VisitBriefContent;
  onChange: (patch: Partial<VisitBriefContent>) => void;
}

export function BriefLabs({ brief, onChange }: BriefListsProps) {
  const labs = brief.labs;
  const set = (next: VisitBriefLab[]) => onChange({ labs: next });
  return (
    <section className={styles.block}>
      <h3 className={styles.h3}>3. Tests to Discuss</h3>
      {labs.length === 0 && <p className={styles.muted}>No tests listed yet.</p>}
      <ul className={styles.list}>
        {labs.map((lab, i) => (
          <li key={`lab-${i}`} className={styles.editRow}>
            <select
              className={styles.select}
              aria-label="Test priority"
              value={lab.tier}
              onChange={(e) => {
                const tier = e.target.value as VisitBriefLab['tier'];
                set(labs.map((x, j) => (j === i ? { ...x, tier } : x)));
              }}
            >
              <option value="primary">Primary</option>
              <option value="also">Also request</option>
            </select>
            <input
              className={styles.field}
              aria-label="Test name"
              placeholder="Test name"
              value={lab.name}
              onChange={(e) => set(labs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
            />
            <input
              className={styles.field}
              aria-label="Reason for test"
              placeholder="Reason / timing"
              value={lab.reason}
              onChange={(e) => set(labs.map((x, j) => (j === i ? { ...x, reason: e.target.value } : x)))}
            />
            <button type="button" className={styles.remove} aria-label="Remove test" onClick={() => set(labs.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" leadingIcon="plus" onClick={() => set([...labs, { name: '', tier: 'also', reason: '' }])}>
        Add lab
      </Button>
    </section>
  );
}

export function BriefQuestions({ brief, onChange }: BriefListsProps) {
  const questions = brief.questions;
  const set = (next: VisitBriefQuestion[]) => onChange({ questions: next });
  return (
    <section className={styles.block}>
      <h3 className={styles.h3}>4. Questions for My Provider</h3>
      {questions.length === 0 && <p className={styles.muted}>No questions listed yet.</p>}
      <ol className={styles.numberedEdit}>
        {questions.map((q, i) => (
          <li key={`q-${i}`} className={styles.editRow}>
            <input
              className={styles.field}
              aria-label="Question"
              placeholder="Question for my provider"
              value={q.text}
              onChange={(e) => set(questions.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
            />
            <input
              className={styles.field}
              aria-label="Why I’m asking"
              placeholder="Why I’m asking"
              value={q.why}
              onChange={(e) => set(questions.map((x, j) => (j === i ? { ...x, why: e.target.value } : x)))}
            />
            <button type="button" className={styles.remove} aria-label="Remove question" onClick={() => set(questions.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ol>
      <Button
        variant="ghost"
        size="sm"
        leadingIcon="plus"
        onClick={() => set([...questions, { text: '', why: 'Why I’m asking: context from my conversation with Deborah AI.' }])}
      >
        Add question
      </Button>
    </section>
  );
}

export function BriefMeds({ brief, onChange }: BriefListsProps) {
  const medications = brief.medications;
  const set = (next: VisitBriefMed[]) => onChange({ medications: next });
  return (
    <section className={styles.block}>
      <h3 className={styles.h3}>5. Current Medications & Supplements</h3>
      {medications.length === 0 && <p className={styles.muted}>None listed yet.</p>}
      <ul className={styles.list}>
        {medications.map((m, i) => (
          <li key={`med-${i}`} className={m.genesisGoldNote ? `${styles.editRow} ${styles.gold}` : styles.editRow}>
            <input
              className={styles.field}
              aria-label="Medication name"
              placeholder="Medication / supplement"
              value={m.name}
              onChange={(e) => set(medications.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
            />
            <input
              className={styles.field}
              aria-label="Dose"
              placeholder="Dose / frequency"
              value={m.dose ?? ''}
              onChange={(e) => set(medications.map((x, j) => (j === i ? { ...x, dose: e.target.value } : x)))}
            />
            {m.genesisGoldNote && <span className={styles.why}>{m.genesisGoldNote}</span>}
            <button type="button" className={styles.remove} aria-label="Remove medication" onClick={() => set(medications.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" leadingIcon="plus" onClick={() => set([...medications, { name: '', dose: '', current: true }])}>
        Add medication
      </Button>
    </section>
  );
}
