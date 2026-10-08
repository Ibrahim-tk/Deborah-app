/**
 * @pattern HabitRow — checkbox, habit text, small plain-text source ("from your answer").
 *          Tap toggles today; long-press (or context menu) asks to remove. Gentle check, no bounce.
 * @usedBy  M-7.3
 * @spec    docs/ux/F07-my-health-hub.md#m-73--your-90-day-plan
 * @xref    web: apps/web/patterns/health/HabitRow — not built
 */
import { useRef } from 'react';
import { AnimatePresence, DURATION, EASE_OUT, Icon, MotionSpan, useReducedMotionPref } from '@mobile/ui';
import styles from './HabitRow.module.css';

export interface HabitRowProps {
  text: string;
  done: boolean;
  /** Where the habit came from, e.g. "from your answer". */
  source?: string;
  onToggle: () => void;
  onLongPress: () => void;
}

const LONG_PRESS_MS = 500;

export function HabitRow({ text, done, source, onToggle, onLongPress }: HabitRowProps) {
  const reduced = useReducedMotionPref();
  const timer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);

  const clear = () => window.clearTimeout(timer.current);
  const start = () => {
    longPressed.current = false;
    clear();
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const check = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: DURATION.reduced } }
    : { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.6 }, transition: { duration: DURATION.base, ease: EASE_OUT } };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-description="Long-press to remove"
      className={styles.root}
      onPointerDown={start}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => {
        e.preventDefault();
        clear();
        if (!longPressed.current) onLongPress();
        longPressed.current = true;
      }}
      onClick={() => {
        if (longPressed.current) return void (longPressed.current = false);
        onToggle();
      }}
    >
      <span className={styles.box} data-checked={done} aria-hidden="true">
        <AnimatePresence initial={false}>
          {done && (
            <MotionSpan key="check" className={styles.check} {...check}>
              <Icon name="check" size={18} strokeWidth={2} />
            </MotionSpan>
          )}
        </AnimatePresence>
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{text}</span>
        {source && <span className={styles.source}>{source}</span>}
      </span>
    </button>
  );
}
