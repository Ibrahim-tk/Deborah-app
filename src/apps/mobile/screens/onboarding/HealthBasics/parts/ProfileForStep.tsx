/**
 * First step of the health basics: who the profile is for, as two stacked cards (design direction
 * 2026-10-20, Notion-onboarding style): a line doodle on the left, a title and one line on the right.
 * Tapping outlines the card, then moves on (was its own screen, M-1.7, before 2026-10-13 rev 4).
 * OPEN: "Family member / dependent" — how the dependent's own profile (name, relationship, guardian consent)
 * is created is not specified. Until then it is recorded on the account holder's profile.
 */
import { FamilyDoodle, SelfDoodle } from './ProfileDoodles';
import styles from './ProfileForStep.module.css';

const CHOICES = [
  { value: 'self', title: 'For myself', sub: 'My own health, sleep, hormones and energy.', Art: SelfDoodle },
  { value: 'dependent', title: 'For a family member', sub: 'Someone I care for, like a parent or child.', Art: FamilyDoodle },
] as const;

export interface ProfileForStepProps {
  value?: string;
  onPick: (value: string) => void;
}

export function ProfileForStep({ value, onPick }: ProfileForStepProps) {
  return (
    <div className={styles.tiles} role="radiogroup" aria-label="Who is this profile for?">
      {CHOICES.map(({ value: v, title, sub, Art }) => {
        const on = value === v;
        return (
          <button key={v} type="button" role="radio" aria-checked={on} className={styles.tile} data-on={on || undefined} onClick={() => onPick(v)}>
            <span className={styles.art}><Art size={64} /></span>
            <span className={styles.text}>
              <span className={styles.tileTitle}>{title}</span>
              <span className={styles.tileSub}>{sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
