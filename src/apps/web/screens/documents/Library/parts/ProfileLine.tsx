/** Whose library this is: "Myself" / "{name}". Opens the profile switcher (M-6.1) when there are others. */
import { useAppStore } from '@shared/store';
import { Icon } from '@web/ui';
import { useNav } from '@web/navigation';
import styles from './ProfileLine.module.css';

export interface ProfileLineProps {
  profileId: string;
  /** False when the screen was opened for a specific profile (Profile details). */
  switchable: boolean;
}

export function ProfileLine({ profileId, switchable }: ProfileLineProps) {
  const { presentSheet } = useNav();
  const profile = useAppStore((s) => s.profiles.byId[profileId]);
  const count = useAppStore((s) => s.profiles.order.length);
  const label = !profile || profile.relationship === 'self' ? 'Myself' : profile.name;

  if (!switchable || count < 2) return <p className={styles.line}>{label}</p>;
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`Showing ${label}. Switch profile`}
      onClick={() => presentSheet('M-6.1', undefined, { detent: count > 3 ? 'large' : 'medium' })}
    >
      {label}
      <Icon name="chevronDown" size={18} />
    </button>
  );
}
