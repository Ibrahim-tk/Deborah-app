/**
 * @app AdminApp — Super Admin console. Derived from WebApp: same stylesheet stack and borrowed
 *      web primitives, its own navigator, store (@shared/admin) and screens. Web never imports admin.
 */
import { useEffect } from 'react';
import { attachOverlay, Toast } from './ui';
import { AdminNavigator } from './navigation';
import { useAdminToastStore } from './hooks/toast.store';
import '@web/styles/mobile.tokens.css';
import '@web/styles/mobile.refresh.css';
import '@web/styles/mobile.base.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@web/styles/mobile.skin.deborah.css';
import '@web/styles/web.tokens.css';
import '@web/styles/web.base.css';
import styles from './AdminApp.module.css';

export default function AdminApp() {
  const toast = useAdminToastStore((s) => s.toast);
  const clear = useAdminToastStore((s) => s.clear);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clear, 2500);
    return () => clearTimeout(t);
  }, [toast, clear]);

  return (
    <div className={`web-root phone-root ${styles.root}`}>
      <AdminNavigator />
      <div ref={attachOverlay} />
      {toast && (
        <div key={toast.id} className={styles.toast}>
          <Toast message={toast.message} />
        </div>
      )}
    </div>
  );
}
