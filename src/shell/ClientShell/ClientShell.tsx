/**
 * @shell ClientShell — production-facing page: ClientTopNav + Version 2 phone + screen guide notes.
 * No version switch, platform tabs, journeys, captions, or design-system tools.
 * Sticky notes are for the client handoff; internal tooling stays on /internal.
 */
import MobileApp from '@mobile/MobileApp';
import { useShellStore } from '../shell.store';
import { ClientTopNav } from '../nav/ClientTopNav';
import { IPhoneFrame } from '../device/IPhoneFrame';
import { ScreenNote } from '../notes/ScreenNote';
import { ShellToast } from '../Shell/parts/ShellToast';
import { useShellEffects } from '../Shell/useShellEffects';
import '../Shell/dev-overlays.css';
import styles from '../Shell/Shell.module.css';

export function ClientShell() {
  useShellEffects();
  const theme = useShellStore((s) => s.theme);

  return (
    <div className={styles.root} data-theme={theme}>
      <ClientTopNav />
      <main className={styles.stage}>
        <IPhoneFrame>
          <MobileApp />
        </IPhoneFrame>
        <ScreenNote audience="client" />
      </main>
      <ShellToast />
    </div>
  );
}
