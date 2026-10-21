/** In-chat tile pointing to the optional Health profile (M-2.14): the shared IntakeTile, spaced for the thread. */
import { selectActiveProfile, useAppStore } from '@shared/store';
import { IntakeTile } from '@mobile/patterns/health';
import { healthProfileCompletion } from '@mobile/screens/onboarding/HealthBasics/healthProfile';
import styles from './IntakeBanner.module.css';

export function IntakeBanner({ onComplete }: { onComplete: () => void }) {
  const profile = useAppStore(selectActiveProfile);
  const progress = profile ? healthProfileCompletion(profile) : 0;
  return <IntakeTile className={styles.tile} progress={progress} onOpen={onComplete} />;
}
