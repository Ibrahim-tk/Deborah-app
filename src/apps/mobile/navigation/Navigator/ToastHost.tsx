/** Shows the current app toast for 2.5 s; on mobile it drops in from the top (designer, 2026-10-28). */
import { useEffect } from 'react';
import { AnimatePresence, DURATION, MotionDiv, Toast } from '@mobile/ui';
import { useToastStore } from '@mobile/hooks/toast.store';
import styles from './Navigator.module.css';

export function ToastHost({ lifted, overComposer }: { lifted: boolean; overComposer: boolean }) {
  const toast = useToastStore((s) => s.toast);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clear, 2500);
    return () => window.clearTimeout(id);
  }, [toast, clear]);

  return (
    <div className={styles.toastHost} data-lifted={lifted || undefined} data-over-composer={(lifted && overComposer) || undefined}>
      <AnimatePresence>
        {toast && (
          <MotionDiv key={toast.id} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: DURATION.base }}>
            <Toast message={toast.message} icon={toast.icon} />
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
