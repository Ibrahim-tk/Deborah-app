/**
 * @screen  M-9.1 · My Health records
 * @flow    F09 My Health records
 * @states  loading (skeleton) · consultations · notes · labs · each segment empty · other profile
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=50-598
 * @spec    docs/ux/F09-records.md#m-91--records
 * @xref    web: W-9.1 (apps/web/screens/records/Records) — not built
 */
import { useEffect, useState } from 'react';
import { useAppStore } from '@shared/store';
import { Header, Segmented, Skeleton } from '@mobile/ui';
import { simBetween } from '@mobile/hooks/simTiming';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { RecordsList, type Segment } from './parts/RecordsList';
import styles from './Records.module.css';

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'consultations', label: 'Consultations' },
  { value: 'notes', label: 'Visit Notes' },
  { value: 'labs', label: 'Labs' },
];

export default function Records() {
  const params = useScreenParams<{ segment: Segment; profileId: string }>();
  const { pop } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const profileId = params.profileId ?? activeProfileId;
  const profile = useAppStore((s) => s.profiles.byId[profileId]);
  const [segment, setSegment] = useState<Segment>(params.segment ?? 'consultations');
  const [loading, setLoading] = useState(true);

  // Simulated first load (docs/ux/00-ux-overview.md §3: skeletons 300–600 ms).
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simBetween(300, 600));
    return () => window.clearTimeout(t);
  }, []);

  const otherProfile = Boolean(profile) && (profileId !== activeProfileId || profile?.relationship !== 'self');

  return (
    <div className={styles.root} data-xref="M-9.1 · My Health records">
      <Header title="My Health records" onBack={canGoBack ? pop : undefined} backLabel={previousTitle} />
      <div className={styles.body}>
        <div className={styles.top}>
          {otherProfile && <p className={styles.context}>{`${profile?.name}’s records`}</p>}
          <Segmented label="Record type" options={SEGMENTS} value={segment} onChange={setSegment} />
        </div>
        {loading ? (
          <div className={styles.skeleton} aria-busy="true" aria-label="Loading records">
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeletonRow}>
                <Skeleton height={40} width={40} />
                <div className={styles.skeletonText}>
                  <Skeleton height={20} width="70%" />
                  <Skeleton height={16} width="45%" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RecordsList segment={segment} profileId={profileId} isActiveProfile={profileId === activeProfileId} />
        )}
      </div>
    </div>
  );
}
