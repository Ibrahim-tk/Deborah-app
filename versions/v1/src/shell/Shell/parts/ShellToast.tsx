/** Neutral shell toast (scenario loaded, reset, copied). Auto-dismisses after 2.5 s. */
import { useEffect } from 'react';
import { useShellStore } from '../../shell.store';
import styles from '../Shell.module.css';

export function ShellToast() {
  const toast = useShellStore((s) => s.toast);
  const clearToast = useShellStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clearToast, 2500);
    return () => window.clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;
  return (
    <div key={toast.id} className={styles.toast} role="status">
      {toast.message}
    </div>
  );
}
