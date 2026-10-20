/** In-chat tile pointing to the optional Health profile (M-2.14): ring shows how much of the intake is done. */
import { intakeProgress } from '@shared/engine/intake';
import { useAppStore } from '@shared/store';
import { ActionTile } from '@mobile/ui';
import styles from './IntakeBanner.module.css';

export function IntakeBanner({ onComplete }: { onComplete: () => void }) {
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const progress = profile ? intakeProgress(profile) : 0;
  return (
    <ActionTile
      className={styles.tile}
      icon="health"
      title="Finish your health intake"
      meta="Helps Deborah personalise her guidance"
      progress={progress}
      progressLabel="Health intake progress"
      onClick={onComplete}
    />
  );
}
