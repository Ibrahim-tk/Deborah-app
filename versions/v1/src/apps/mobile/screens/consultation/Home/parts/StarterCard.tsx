/**
 * Home starter card (first-time user only): "Start with Deborah" hero with three prompt
 * rows. A row opens the chat with that answer prefilled (the user still sends it).
 * Rows, not chips (DESIGN.md bans pills). Copy is placeholder until Deborah approves it.
 */
import { DeborahBlob, Icon } from '@flow-v1/apps/mobile/ui';
import styles from './StarterCard.module.css';

// Intake V2 Home: "Start with Deborah" hero with three prompts.
const QUESTION = 'Start with Deborah';
const ANSWERS = [
  { label: 'I keep waking up at night', prefill: 'I keep waking up during the night.' },
  { label: 'I’m tired all the time', prefill: 'I’m tired all the time, even after sleeping.' },
  { label: 'Hot flashes are wearing me down', prefill: 'My hot flashes are wearing me down.' },
];

export function StarterCard({ onAnswer }: { onAnswer: (prefill: string) => void }) {
  return (
    <section className={styles.root} aria-label="Start with Deborah" data-placeholder>
      <div className={styles.head}>
        <DeborahBlob size={36} label="Deborah" />
        <h2 className={styles.question}>{QUESTION}</h2>
      </div>
      <ul className={styles.list}>
        {ANSWERS.map((a) => (
          <li key={a.label}>
            <button type="button" className={styles.row} onClick={() => onAnswer(a.prefill)}>
              <span>{a.label}</span>
              <Icon name="chevron" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
