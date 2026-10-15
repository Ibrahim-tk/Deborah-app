/** @flow-v1/shell PlatformTabs — Mobile | Web | Design system. Remembers the last web route. Keyboard: 1 / 2 / 3. */
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
  const isSystem = pathname.startsWith('/design-system');

  const goMobile = () => navigate('/mobile');
  const goWeb = () => navigate(lastWebPath);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === '1') navigate('/mobile');
      if (e.key === '2') navigate(lastWebPath);
      if (e.key === '3') navigate('/design-system');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, lastWebPath]);

  return (
    <div className={styles.root} role="tablist" aria-label="Platform">
      <button type="button" role="tab" aria-selected={!isWeb && !isSystem} className={styles.tab} onClick={goMobile} title="Mobile (1)">
        Mobile
      </button>
      <button type="button" role="tab" aria-selected={isWeb} className={styles.tab} onClick={goWeb} title="Web (2)">
        Web
      </button>
      <button type="button" role="tab" aria-selected={isSystem} className={styles.tab} onClick={() => navigate('/design-system')} title="Design system (3)">
        Design system
      </button>
    </div>
  );
}
