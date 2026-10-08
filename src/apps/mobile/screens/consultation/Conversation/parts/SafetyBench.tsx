/** Dev-only S13 Safety test bench: inserts canonical guardrail phrases into the composer (docs/ux/F03-safety.md). */
import { useState } from 'react';
import { guardrailsData } from '@shared/data';
import { OptionList, OptionRow } from '@mobile/ui';
import styles from '../Conversation.module.css';

const LABELS = {
  emergency: 'Emergency',
  medication: 'Medication',
  crisis: 'Crisis',
  outOfScope: 'Out of scope',
  escalation: 'Escalation',
} as const;

export function SafetyBench({ onInsert }: { onInsert: (phrase: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.bench} onMouseDown={(e) => e.preventDefault()}>
      <button
        type="button"
        className={styles.benchLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        DEV · Safety test bench {open ? '▾' : '▸'}
      </button>
      {open && (
        <OptionList layout="grid2" label="Insert a test phrase">
          {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((k) => (
            <OptionRow key={k} onSelect={() => onInsert(guardrailsData.testPhrases[k])}>
              {LABELS[k]}
            </OptionRow>
          ))}
        </OptionList>
      )}
    </div>
  );
}
