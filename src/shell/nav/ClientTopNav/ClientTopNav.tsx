/** Client-facing top bar: brand · Home · Chat · Reset. No prototype tooling. */
import { requestClientNav } from '../../clientNav';
import { ResetButton } from '../ResetButton';
import styles from './ClientTopNav.module.css';

export function ClientTopNav() {
  return (
    <header className={styles.root}>
      <h1 className={styles.brand}>Your Oracle Clinician</h1>
      <nav className={styles.actions} aria-label="Client">
        <button type="button" className={styles.link} onClick={() => requestClientNav('home')}>
          Home
        </button>
        <button type="button" className={styles.link} onClick={() => requestClientNav('chat')}>
          Chat
        </button>
        <ResetButton />
      </nav>
    </header>
  );
}
