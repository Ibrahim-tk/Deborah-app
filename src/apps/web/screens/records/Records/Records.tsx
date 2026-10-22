/**
 * @screen  M-9.1 · My Health records (web)
 * @flow    F09 My Health records
 * @states  loading · notes · labs · search · empty · other profile · wide master–detail (consultation / lab)
 * @spec    docs/ux/F09-records.md#m-91--records
 * @xref    mobile: apps/mobile/screens/records/Records
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { useAppStore } from '@shared/store';
import { useDevice } from '@shell/device';
import { GlassButton, Header, Segmented, Skeleton } from '@web/ui';
import { simBetween } from '@web/hooks/simTiming';
import { useWideSplit } from '@web/hooks/useWideSplit';
import { useNav, useRoute, useScreenParams } from '@web/navigation';
import { DetailHostProvider } from '../../DetailHost';
import { RecordsList, type RecordsSelection, type Segment } from './parts/RecordsList';
import { RecordsSearch } from './parts/RecordsSearch';
import { SearchResults } from './parts/SearchResults';
import styles from './Records.module.css';

const ConsultationDetail = lazy(() => import('../ConsultationDetail'));
const LabReport = lazy(() => import('../LabReport'));

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'notes', label: 'Visit Notes' },
  { value: 'labs', label: 'Labs' },
  { value: 'attachments', label: 'Attachments' },
];

export default function Records() {
  const params = useScreenParams<{ segment: Segment; profileId: string }>();
  const { pop, open } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const profileId = params.profileId ?? activeProfileId;
  const profile = useAppStore((s) => s.profiles.byId[profileId]);
  const [segment, setSegment] = useState<Segment>(params.segment === 'labs' || params.segment === 'attachments' ? params.segment : 'notes');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [selection, setSelection] = useState<{ scope: string; value: RecordsSelection } | null>(null);
  const wide = useWideSplit();
  const { setClientGuide } = useDevice();
  const scope = `${profileId}:${segment}`;
  const closeSearch = () => {
    setSearching(false);
    setQuery('');
    setExpanded(false);
  };

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simBetween(300, 600));
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const guide = segment === 'labs' ? 'records-labs' : segment === 'attachments' ? 'records-attachments' : 'records-notes';
    setClientGuide(guide);
    return () => setClientGuide(null);
  }, [segment, setClientGuide]);

  const otherProfile = Boolean(profile) && (profileId !== activeProfileId || profile?.relationship !== 'self');
  const paneSelection = wide && selection?.scope === scope ? selection.value : null;

  const onSelect = (next: RecordsSelection) => {
    if (wide) setSelection({ scope, value: next });
    else if (next.kind === 'consultation') open('M-9.2', { conversationId: next.id });
    else open('M-9.5', { reportId: next.id });
  };

  const list = (
    <>
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
        <RecordsList
          segment={segment}
          profileId={profileId}
          isActiveProfile={profileId === activeProfileId}
          selection={paneSelection}
          onSelect={wide ? onSelect : undefined}
        />
      )}
    </>
  );

  return (
    <div className={styles.root} data-xref="M-9.1 · My Health records" data-split={wide || undefined}>
      <Header
        title="My Health records"
        onBack={canGoBack ? pop : undefined}
        backLabel={previousTitle}
        right={<GlassButton icon="search" aria-label="Search records" onClick={() => setSearching(true)} />}
      />
      <div className={styles.body}>
        <div className={styles.listPane}>{list}</div>
        {wide && (
          <div className={styles.detailPane} aria-live="polite">
            {paneSelection ? (
              <DetailHostProvider
                screenId={paneSelection.kind === 'consultation' ? 'M-9.2' : 'M-9.5'}
                params={paneSelection.kind === 'consultation' ? { conversationId: paneSelection.id } : { reportId: paneSelection.id }}
                previousTitle="Records"
                onClear={() => setSelection((s) => (s?.scope === scope ? null : s))}
              >
                <Suspense fallback={<div className={styles.paneLoading}>Loading…</div>}>
                  {paneSelection.kind === 'consultation' ? <ConsultationDetail /> : <LabReport />}
                </Suspense>
              </DetailHostProvider>
            ) : (
              <p className={styles.paneEmpty}>Select a consultation or lab to read it here.</p>
            )}
          </div>
        )}
      </div>
      {searching && (
        <RecordsSearch
          query={query}
          onChange={(q) => {
            setQuery(q);
            if (!q.trim()) setExpanded(false);
          }}
          onClose={closeSearch}
          expanded={expanded}
          onExpand={() => setExpanded(true)}
        >
          <SearchResults query={query} profileId={profileId} onPick={closeSearch} variant={expanded ? 'full' : 'list'} onSeeAll={() => setExpanded(true)} />
        </RecordsSearch>
      )}
    </div>
  );
}
