/** @ui ActionSheet — iOS action sheet: grouped actions + Cancel, over a scrim. */
import { useEffect } from 'react';
import { AnimatePresence, DURATION, EASE_IOS, MotionDiv, REDUCED_FADE, useReducedMotionPref } from '../Motion';
import { Overlay } from '../Overlay';
import styles from './ActionSheet.module.css';

export interface ActionSheetAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

export interface ActionSheetProps {
  open: boolean;
  title?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

export function ActionSheet({ open, title, actions, onClose }: ActionSheetProps) {
  const reduced = useReducedMotionPref();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const slide = reduced
    ? REDUCED_FADE
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { duration: DURATION.sheet, ease: EASE_IOS } };

  return (
    <Overlay>
      <AnimatePresence>
        {open && (
          <div className={styles.root} key="action-sheet">
            <MotionDiv className={styles.scrim} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.base }} />
            <MotionDiv className={styles.panel} role="dialog" aria-modal="true" aria-label={title ?? 'Actions'} {...slide}>
              <div className={styles.group}>
                {title && <p className={styles.title}>{title}</p>}
                {actions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    className={styles.action}
                    data-destructive={a.destructive || undefined}
                    onClick={() => {
                      onClose();
                      a.onSelect();
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <button type="button" className={`${styles.group} ${styles.cancel}`} onClick={onClose} autoFocus>
                Cancel
              </button>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </Overlay>
  );
}
