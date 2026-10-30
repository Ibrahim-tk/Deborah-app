/** @shell ClientEmailShell — client-facing dummy inbox (/email): the teen's invitation email (story 1.5). */
import { useShellStore } from '../shell.store';
import { ClientTopNav } from '../nav/ClientTopNav';
import { EmailInbox } from '../inbox/EmailInbox';
import { ShellToast } from '../Shell/parts/ShellToast';
import styles from '../Shell/Shell.module.css';

export function ClientEmailShell() {
  const theme = useShellStore((s) => s.theme);
  return (
    <div className={styles.root} data-theme={theme}>
      <ClientTopNav />
      <main className={styles.stage}>
        <EmailInbox mobilePath="/" webPath="/web" />
      </main>
      <ShellToast />
    </div>
  );
}
