/** M-7.2 loading: static skeleton cards for 400 ms on first open (no shimmer). */
import { Skeleton } from '@mobile/ui';
import styles from './Hub.module.css';

export function HubSkeleton() {
  return (
    <div className={styles.stack} aria-busy="true" aria-label="Loading your health picture">
      <Skeleton height={136} />
      <Skeleton height={112} />
      <Skeleton height={88} />
      <Skeleton height={88} />
      <Skeleton height={24} width="60%" />
      <Skeleton height={96} />
    </div>
  );
}
