/** In-chat tile pointing to the optional Health profile (M-2.14): the shared IntakeTile, spaced for the thread. */
import { IntakeTile } from '@mobile/patterns/health';
import styles from './IntakeBanner.module.css';

export function IntakeBanner({ onComplete }: { onComplete: () => void }) {
  return <IntakeTile className={styles.tile} onOpen={onComplete} />;
}
