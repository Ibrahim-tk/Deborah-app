/**
 * Home · State 1 — new user who skipped the chat (Figma 170:145). No journey, reports or
 * profile yet, so nothing that leads nowhere: Start with Deborah (3 ready-made prompts), Build
 * your health profile (ring), the 90 Day Journey as a locked preview, and a small family row.
 * Prompt copy is placeholder until Deborah approves it.
 */
import { Icon, ProgressRing } from '@mobile/ui';
import { Action, LinkCard } from './HomeKit';
import styles from './HomeStates.module.css';

const PROMPTS = [
  { label: 'I’ve been feeling tired', prefill: 'I’ve been feeling tired all the time.' },
  { label: 'Help me with sleep', prefill: 'Can you help me with my sleep?' },
  { label: 'Review my supplements', prefill: 'Can you review the supplements I take?' },
];

export interface StateNewProps {
  onPrompt: (prefill: string) => void;
  /** Absent when the profile card isn't offered (intake V2 off, or already complete). */
  profile?: { progress: number; onOpen: () => void };
  onAddFamily: () => void;
}

export function StateNew({ onPrompt, profile, onAddFamily }: StateNewProps) {
  return (
    <>
      <section className={styles.hero} aria-labelledby="start-deborah" data-placeholder>
        <div className={styles.heroText}>
          <h2 id="start-deborah" className={styles.heroTitle}>Start with Deborah</h2>
          <p className={styles.heroBody}>Tell her what’s going on. She’ll ask a few questions, then share what she thinks.</p>
        </div>
        <ul className={styles.prompts}>
          {PROMPTS.map((p) => (
            <li key={p.label}>
              <button type="button" className={styles.prompt} onClick={() => onPrompt(p.prefill)}>
                <span>{p.label}</span>
                <Icon name="chevron" size={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {profile && (
        <button type="button" className={styles.profileCard} onClick={profile.onOpen}>
          <ProgressRing value={profile.progress} size={52} label="Health profile complete" />
          <span className={styles.profileText}>
            <span className={styles.cardTitle}>Build your health profile</span>
            <span className={styles.cardMeta}>2 min · medications, allergies, date of birth</span>
          </span>
          <Action />
        </button>
      )}

      <LinkCard tone="rose" title="90 Day Journey" meta="Your personalized plan unlocks after your first conversation." icon="lock" label="90 Day Journey, locked" />

      <button type="button" className={styles.familyRow} onClick={onAddFamily}>
        <span className={styles.plus} aria-hidden>
          <Icon name="plus" size={18} />
        </span>
        <span className={styles.familyText}>Add a family member</span>
        <Icon name="chevron" size={18} />
      </button>
    </>
  );
}
