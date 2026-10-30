/** Client-facing top bar: brand · Mobile | Web tabs · Home · Chat · Teen invite · Reset. No prototype tooling. */
import { useLocation, useNavigate } from 'react-router-dom';
import { requestClientNav } from '../../clientNav';
import tabs from '../PlatformTabs/PlatformTabs.module.css';
import { ResetButton } from '../ResetButton';
import { TeenFlowButton } from '../TeenFlowButton';
import styles from './ClientTopNav.module.css';

export function ClientTopNav() {
  const navigate = useNavigate();
  const isWeb = useLocation().pathname.startsWith('/web');
  return (
    <header className={styles.root}>
      <h1 className={styles.brand}>Your Oracle</h1>
      {/* Platform tabs (designer, 2026-10-29): same look as /internal, client routes only. */}
      <div className={`${tabs.root} ${styles.tabs}`} role="tablist" aria-label="Platform">
        <button type="button" role="tab" aria-selected={!isWeb} className={tabs.tab} onClick={() => navigate('/')}>Mobile</button>
        <button type="button" role="tab" aria-selected={isWeb} className={tabs.tab} onClick={() => navigate('/web')}>Web</button>
      </div>
      <nav className={styles.actions} aria-label="Client">
        <button type="button" className={styles.link} onClick={() => requestClientNav('home')}>
          Home
        </button>
        <button type="button" className={styles.link} onClick={() => requestClientNav('chat')}>
          Chat
        </button>
        <TeenFlowButton />
        <ResetButton />
      </nav>
    </header>
  );
}
