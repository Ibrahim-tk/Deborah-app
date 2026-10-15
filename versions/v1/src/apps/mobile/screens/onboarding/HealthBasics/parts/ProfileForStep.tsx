/**
 * First step of the health basics: who the profile is for, as two big icon tiles. Tapping fills the
 * icon and highlights the tile, then moves on (was its own screen, M-1.7, before 2026-10-13 rev 4).
 * OPEN: "Family member / dependent" — how the dependent's own profile (name, relationship, guardian consent)
 * is created is not specified. Until then it is recorded on the account holder's profile.
 */
import { Icon } from '@flow-v1/apps/mobile/ui';
import { FamilyIcon, SelfIcon } from './ProfileIcons';
import styles from './ProfileForStep.module.css';

const CHOICES = [
  { value: 'self', title: 'Myself', sub: 'For my own health conversations.', Glyph: SelfIcon },
  { value: 'dependent', title: 'Family member or dependent', sub: 'For someone I care for.', Glyph: FamilyIcon },
] as const;

export interface ProfileForStepProps {
  value?: string;
  onPick: (value: string) => void;
}

export function ProfileForStep({ value, onPick }: ProfileForStepProps) {
  return (
    <div className={styles.tiles} role="radiogroup" aria-label="Who is this profile for?">
      {CHOICES.map(({ value: v, title, sub, Glyph }) => {
        const on = value === v;
        return (
          <button key={v} type="button" role="radio" aria-checked={on} className={styles.tile} data-on={on || undefined} onClick={() => onPick(v)}>
            <span className={styles.badge}><Glyph filled={on} size={34} /></span>
            <span className={styles.text}>
              <span className={styles.tileTitle}>{title}</span>
              <span className={styles.tileSub}>{sub}</span>
            </span>
            <Icon name="chevron" size={20} className={styles.chevron} />
          </button>
        );
      })}
    </div>
  );
}
