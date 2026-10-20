/**
 * First step of the health basics: who the profile is for, as two big side-by-side tiles (design direction
 * 2026-10-20): a large line icon centred over a short label, no body copy. Tapping highlights the tile, then moves on (was its own screen, M-1.7, before 2026-10-13 rev 4).
 * OPEN: "Family member / dependent" — how the dependent's own profile (name, relationship, guardian consent)
 * is created is not specified. Until then it is recorded on the account holder's profile.
 */
import { Icon } from '@mobile/ui';
import styles from './ProfileForStep.module.css';

const CHOICES = [
  { value: 'self', title: 'Myself', icon: 'account' },
  { value: 'dependent', title: 'For family member', icon: 'family' },
] as const;

export interface ProfileForStepProps {
  value?: string;
  onPick: (value: string) => void;
}

export function ProfileForStep({ value, onPick }: ProfileForStepProps) {
  return (
    <div className={styles.tiles} role="radiogroup" aria-label="Who is this profile for?">
      {CHOICES.map(({ value: v, title, icon }) => {
        const on = value === v;
        return (
          <button key={v} type="button" role="radio" aria-checked={on} className={styles.tile} data-on={on || undefined} onClick={() => onPick(v)}>
            <span className={styles.badge}><Icon name={icon} size={32} strokeWidth={1.5} /></span>
            <span className={styles.tileTitle}>{title}</span>
            {/* Selected: a small check in the corner, so the choice reads without relying on colour. */}
            <span className={styles.check} aria-hidden><Icon name="check" size={14} /></span>
          </button>
        );
      })}
    </div>
  );
}
