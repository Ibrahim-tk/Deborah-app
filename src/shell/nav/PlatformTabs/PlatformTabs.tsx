/** @shell PlatformTabs — Mobile | Web. Remembers the last web route. Keyboard: 1 / 2. */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShellStore } from '../../shell.store';
import styles from './PlatformTabs.module.css';

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export function PlatformTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lastWebPath = useShellStore((s) => s.lastWebPath);
  const isWeb = pathname.startsWith('/web');

  const goMobile = () => navigate('/mobile');
  const goWeb = () => navigate(lastWebPath);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === '1') navigate('/mobile');
      if (e.key === '2') navigate(lastWebPath);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, lastWebPath]);

  return (
    <div className={styles.root} role="tablist" aria-label="Platform">
      <button type="button" role="tab" aria-selected={!isWeb} className={styles.tab} onClick={goMobile} title="Mobile (1)">
        Mobile
      </button>
      <button type="button" role="tab" aria-selected={isWeb} className={styles.tab} onClick={goWeb} title="Web (2)">
        Web
      </button>
    </div>
  );
}
