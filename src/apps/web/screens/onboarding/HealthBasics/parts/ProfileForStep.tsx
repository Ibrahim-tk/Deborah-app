/**
 * First step of the health basics: who the profile is for, as two tall white cards (design 2026-10-21,
 * collections moodboard): words top-left, a round check top-right;
 * the selected card takes the shared selected state.
 * Tapping outlines the card, then moves on (was its own screen, M-1.7, before 2026-10-13 rev 4).
 * OPEN: "Family member / dependent" — how the dependent's own profile (name, relationship, guardian consent)
 * is created is not specified. Until then it is recorded on the account holder's profile.
 */
import { Icon } from '@web/ui';
import styles from './ProfileForStep.module.css';

const CHOICES = [
  { value: 'self', title: 'For myself', sub: 'My own health, sleep, hormones and energy.' },
  { value: 'dependent', title: 'For a family member', sub: 'Someone I care for, like a parent or child.' },
] as const;

export interface ProfileForStepProps {
  value?: string;
  onPick: (value: string) => void;
}

export function ProfileForStep({ value, onPick }: ProfileForStepProps) {
  return (
    <div className={styles.tiles} role="radiogroup" aria-label="Who is this profile for?">
      {CHOICES.map(({ value: v, title, sub }) => {
        const on = value === v;
        return (
          <button key={v} type="button" role="radio" aria-checked={on} className={styles.tile} data-on={on || undefined} onClick={() => onPick(v)}>
            <span className={styles.text}>
              <span className={styles.tileTitle}>{title}</span>
              <span className={styles.tileSub}>{sub}</span>
            </span>
            <span className={styles.check} aria-hidden>{on && <Icon name="check" size={14} strokeWidth={2.5} />}</span>
          </button>
        );
      })}
    </div>
  );
}
