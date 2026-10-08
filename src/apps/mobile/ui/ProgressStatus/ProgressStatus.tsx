/** @ui ProgressStatus — rotating ring + a status line that crossfades as steps change (no typing dots). */
import { AnimatePresence, DURATION, MotionSpan } from '../Motion';
import { Spinner } from '../Spinner';
import styles from './ProgressStatus.module.css';

export function ProgressStatus({ label }: { label: string }) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <Spinner size={16} />
      <span className={styles.labelWrap}>
        <AnimatePresence mode="wait" initial={false}>
          <MotionSpan
            key={label}
            className={styles.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.quick }}
          >
            {label}
          </MotionSpan>
        </AnimatePresence>
      </span>
    </div>
  );
}
