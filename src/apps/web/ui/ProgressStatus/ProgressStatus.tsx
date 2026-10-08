/** @ui ProgressStatus — rotating ring + a status line that crossfades as steps change (no typing dots). @xref mobile: apps/mobile/ui/ProgressStatus */
import { cx } from '@shared/utils';
import { AnimatePresence, fade, MotionSpan, useReducedMotionPref } from '../Motion';
import { Spinner } from '../Spinner';
import styles from './ProgressStatus.module.css';

export interface ProgressStatusProps {
  label: string;
  className?: string;
}

export function ProgressStatus({ label, className }: ProgressStatusProps) {
  const reduced = useReducedMotionPref();
  return (
    <div className={cx(styles.root, className)} role="status" aria-live="polite">
      <Spinner size={16} />
      <span className={styles.labelWrap}>
        <AnimatePresence mode="wait" initial={false}>
          <MotionSpan key={label} className={styles.label} {...fade(reduced)}>
            {label}
          </MotionSpan>
        </AnimatePresence>
      </span>
    </div>
  );
}
