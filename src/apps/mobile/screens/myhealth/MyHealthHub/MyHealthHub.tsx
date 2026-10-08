/**
 * @screen  M-7.2 · My Health hub (also M-7.1 · My Health — first time, its empty state)
 * @flow    F07 My Health hub
 * @states  loading (400 ms skeleton) · empty (M-7.1) · populated · daughter profile · plan complete · refreshing
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub · #m-71--my-health--first-time-empty-state-of-the-hub
 * @xref    web: W-7.2 (apps/web/screens/myhealth/MyHealthHub) — not built
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { selectHubState, useAppStore } from '@shared/store';
import { Header, Spinner } from '@mobile/ui';
import { useNav, useNavStore, useRoute } from '@mobile/navigation';
import { simMs } from '@mobile/hooks/simTiming';
import { useCollapsingTitle } from '@mobile/hooks/useCollapsingTitle';
import { HubEmpty } from './parts/HubEmpty';
import { HubPopulated } from './parts/HubPopulated';
import { HubSkeleton } from './parts/HubSkeleton';
import { usePullToRefresh } from './parts/usePullToRefresh';
import styles from './MyHealthHub.module.css';

export default function MyHealthHub() {
  const hubState = useAppStore(selectHubState);
  const { pop } = useNav();
  const goHome = useNavStore((s) => s.goHome);
  const { bind, pull, refreshing } = usePullToRefresh();
  // ASSUMPTION: "first open" = each mount of the tab root (the tab keeps its stack, so this is rare).
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simMs(400));
    return () => window.clearTimeout(t);
  }, []);

  const { collapsed, onScroll } = useCollapsingTitle();
  // Opened from Home it sits on the Ask stack: show Back; as the section root, show the menu.
  const { canGoBack, previousTitle } = useRoute();
  return (
    <div className={styles.root} data-xref={hubState === 'empty' ? 'M-7.1 · My Health — first time' : 'M-7.2 · My Health hub'}>
      <Header
        large
        collapsed={collapsed}
        title="My Health"
        // Section screens always lead back to Home, never to the side menu.
        onBack={canGoBack ? pop : goHome}
        backLabel={canGoBack ? previousTitle : 'Home'}
      />
      <div className={styles.scroll} {...bind} onScroll={onScroll}>
        <div className={styles.refresh} data-active={refreshing || pull > 0 || undefined} style={{ '--pull': `${refreshing ? 48 : pull}px` } as CSSProperties}>
          {(refreshing || pull > 0) && <Spinner size={20} label={refreshing ? 'Refreshing' : undefined} />}
        </div>
        <div className={styles.column}>{loading ? <HubSkeleton /> : hubState === 'empty' ? <HubEmpty /> : <HubPopulated />}</div>
      </div>
    </div>
  );
}
