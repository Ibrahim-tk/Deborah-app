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
import { Spinner } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { simMs } from '@web/hooks/simTiming';
import { HubEmpty } from './parts/HubEmpty';
import { HubPopulated } from './parts/HubPopulated';
import { HubSkeleton } from './parts/HubSkeleton';
import { usePullToRefresh } from './parts/usePullToRefresh';
import styles from './MyHealthHub.module.css';

export default function MyHealthHub() {
  const hubState = useAppStore(selectHubState);
  const { bind, pull, refreshing } = usePullToRefresh();
  // ASSUMPTION: "first open" = each mount of the tab root (the tab keeps its stack, so this is rare).
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simMs(400));
    return () => window.clearTimeout(t);
  }, []);

  return (
    <DerivedPage title="My Health" composerPlaceholder="Ask Oracle about your health…">
      <div
        className={styles.stack}
        data-xref={hubState === 'empty' ? 'M-7.1 · My Health — first time' : 'M-7.2 · My Health hub'}
        {...bind}
      >
        <div className={styles.refresh} data-active={refreshing || pull > 0 || undefined} style={{ '--pull': `${refreshing ? 48 : pull}px` } as CSSProperties}>
          {(refreshing || pull > 0) && <Spinner size={20} label={refreshing ? 'Refreshing' : undefined} />}
        </div>
        {loading ? <HubSkeleton /> : hubState === 'empty' ? <HubEmpty /> : <HubPopulated />}
      </div>
    </DerivedPage>
  );
}
