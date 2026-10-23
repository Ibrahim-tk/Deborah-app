/**
 * @shell ClientWebShell — client-facing desktop web: ClientTopNav + full-bleed WebApp.
 * No internal password gate, TopNav tooling, journeys, or captions. Internal twin stays at /internal/web.
 */
import WebApp from '@web/WebApp';
import { useShellStore } from '../shell.store';
import { ClientTopNav } from '../nav/ClientTopNav';
import { WebDeviceHost } from '../browser/WebDeviceHost';
import { ShellToast } from '../Shell/parts/ShellToast';
import { useShellEffects } from '../Shell/useShellEffects';
import '../Shell/dev-overlays.css';
import styles from '../Shell/Shell.module.css';

export function ClientWebShell() {
  useShellEffects();
  const theme = useShellStore((s) => s.theme);

  return (
    <div className={styles.root} data-theme={theme}>
      <ClientTopNav />
      <main className={styles.stage}>
        <div className={styles.fullBleed}>
          <WebDeviceHost>
            <WebApp />
          </WebDeviceHost>
        </div>
      </main>
      <ShellToast />
    </div>
  );
}
