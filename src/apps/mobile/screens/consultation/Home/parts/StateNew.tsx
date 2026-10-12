/**
 * Home · State 1 — new user who skipped the chat (Figma 170:145). No journey, reports or
 * profile yet, so nothing that leads nowhere. First time, the hero is "Complete your profile"
 * (design direction 2026-10-12: it opens the chat on Deborah's first onboarding question); then
 * Start with Deborah (3 ready-made prompts), the 90 Day Journey as a locked preview, and a family row.
 * Prompt copy is placeholder until Deborah approves it.
 */
import { Button, Icon, ProgressRing } from '@mobile/ui';
import { LinkCard } from './HomeKit';
import styles from './HomeStates.module.css';

const PROMPTS = [
  { label: 'I’ve been feeling tired', prefill: 'I’ve been feeling tired all the time.' },
  { label: 'Help me with sleep', prefill: 'Can you help me with my sleep?' },
  { label: 'Review my supplements', prefill: 'Can you review the supplements I take?' },
];

export interface StateNewProps {
  onPrompt: (prefill: string) => void;
  /** Hero: absent once the profile basics are done. */
  profile?: { progress: number; onOpen: () => void };
  onAddFamily: () => void;
}

export function StateNew({ onPrompt, profile, onAddFamily }: StateNewProps) {
  return (
    <>
      {profile && (
        <section className={styles.hero} aria-labelledby="complete-profile">
          <div className={styles.heroHead}>
            <ProgressRing value={profile.progress} size={52} label="Health profile complete" />
            <div className={styles.heroText}>
              <h2 id="complete-profile" className={styles.heroTitle}>Complete your health profile</h2>
              <p className={styles.heroBody}>A few quick questions so Deborah’s guidance fits you. About 2 minutes.</p>
            </div>
          </div>
          <Button fullWidth onClick={profile.onOpen}>Complete your health profile</Button>
        </section>
      )}

      <section className={profile ? styles.secondary : styles.hero} aria-labelledby="start-deborah" data-placeholder>
        <div className={styles.heroText}>
          <h2 id="start-deborah" className={profile ? styles.cardTitle : styles.heroTitle}>Start with Deborah</h2>
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

      <LinkCard tone="rose" lead="calendar" title="90 Day Journey" meta="Your personalized plan unlocks after your first conversation." icon="lock" label="90 Day Journey, locked" />

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
