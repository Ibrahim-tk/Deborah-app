/** @shell PlatformTabs — Mobile | Web | Email | Design system | Components | Home. Keyboard: 1–5. */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShellStore } from '../../shell.store';
import {
  INTERNAL_DESIGN_SYSTEM,
  INTERNAL_EMAIL,
  INTERNAL_HOME,
  INTERNAL_MOBILE,
  INTERNAL_WID,
} from '@shared/utils/internalPaths';
import styles from './PlatformTabs.module.css';

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function PlatformTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lastWebPath = useShellStore((s) => s.lastWebPath);
  const isWeb = pathname.startsWith('/internal/web');
  const isSystem = pathname.startsWith(INTERNAL_DESIGN_SYSTEM);
  const isWidgets = pathname.startsWith(INTERNAL_WID);
  const isHome = pathname.startsWith(INTERNAL_HOME);
  const isEmail = pathname.startsWith(INTERNAL_EMAIL);

  const goProfile = () => navigate(INTERNAL_MOBILE);
  const goWeb = () => navigate(lastWebPath);
  const goSystem = () => navigate(INTERNAL_DESIGN_SYSTEM);
  const goWidgets = () => navigate(INTERNAL_WID);
  const goHome = () => navigate(INTERNAL_HOME);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === '1') navigate(INTERNAL_MOBILE);
      if (e.key === '2') navigate(lastWebPath);
      if (e.key === '3') navigate(INTERNAL_DESIGN_SYSTEM);
      if (e.key === '4') navigate(INTERNAL_WID);
      if (e.key === '5') navigate(INTERNAL_HOME);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, lastWebPath]);

  return (
    <div className={styles.root} role="tablist" aria-label="Platform">
      <button type="button" role="tab" aria-selected={!isWeb && !isSystem && !isWidgets && !isHome && !isEmail} className={styles.tab} onClick={goProfile} title="Mobile (1)">
        Mobile
      </button>
      <button type="button" role="tab" aria-selected={isWeb} className={styles.tab} onClick={goWeb} title="Web (2)">
        Web
      </button>
      {/* Dummy inbox: the teen's invitation email (story 1.5). */}
      <button type="button" role="tab" aria-selected={isEmail} className={styles.tab} onClick={() => navigate(INTERNAL_EMAIL)}>
        Email
      </button>
      <button type="button" role="tab" aria-selected={isSystem} className={styles.tab} onClick={goSystem} title="Design system (3)">
        Design system
      </button>
      <button type="button" role="tab" aria-selected={isWidgets} className={styles.tab} onClick={goWidgets} title="Components (4)">
        Components
      </button>
      <button type="button" role="tab" aria-selected={isHome} className={styles.tab} onClick={goHome} title="Home lab (5)">
        Home
      </button>
    </div>
  );
}
