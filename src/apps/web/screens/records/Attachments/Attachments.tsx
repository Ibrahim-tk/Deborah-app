/**
 * @screen  M-9.12 · Attachments (web)
 * @flow    F09 — lab reports and images (mobile keeps these as two sub-pages of My Notes)
 * @states  labs · images · search · empty · wide master–detail
 * @spec    web derived-pages shell · design request 2026-10-27 (reached from Home + My Health cards)
 * @xref    mobile: apps/mobile/screens/records/Records (Labs + Attachments sub-pages)
 */
import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectProfileLabs, useAppStore } from '@shared/store';
import { useDevice } from '@shell/device';
import { Button, Segmented } from '@web/ui';
import { EmptyState, VisitNoteCard } from '@web/patterns/health';
import { DerivedPage } from '@web/patterns/shell';
import { simBetween } from '@web/hooks/simTiming';
import { useWideSplit } from '@web/hooks/useWideSplit';
import { useAccountGate } from '@web/hooks/useAccountGate';
import { useNav, useScreenParams } from '@web/navigation';
import { DetailHostProvider } from '../../DetailHost';
import { AttachmentsGallery } from '../Records/parts/AttachmentsGallery';
import styles from './Attachments.module.css';

const LabReport = lazy(() => import('../LabReport'));

// OPEN: saved reports stay on Documents (M-11.1); this page holds lab reports and images only.
type Tab = 'labs' | 'images';

const TABS: { value: Tab; label: string }[] = [
  { value: 'labs', label: 'Lab reports' },
  { value: 'images', label: 'Images' },
];

export default function Attachments() {
  const params = useScreenParams<{ tab: Tab; profileId: string }>();
  const { open } = useNav();
  const gate = useAccountGate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const profileId = params.profileId ?? activeProfileId;
  const labs = useAppStore(useShallow((s) => selectProfileLabs(s, profileId)));
  const [tab, setTab] = useState<Tab>(params.tab === 'images' ? 'images' : 'labs');
  const [loading, setLoading] = useState(true);
  const [labId, setLabId] = useState<string | null>(null);
  const wide = useWideSplit();
  const { setClientGuide } = useDevice();
  const q = '';
  const isActive = profileId === activeProfileId;

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simBetween(300, 600));
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setClientGuide(tab === 'labs' ? 'records-labs' : 'records-attachments');
    return () => setClientGuide(null);
  }, [tab, setClientGuide]);

  const filteredLabs = useMemo(
    () =>
      labs.filter((r) => {
        if (!q) return true;
        return `${r.panelTitle ?? ''} ${r.labName ?? ''}`.toLowerCase().includes(q);
      }),
    [labs, q],
  );

  // A lab report always opens as its own page with Back (design 2026-10-27), not in a side pane.
  const openLab = (id: string) => open('M-9.5', { reportId: id });

  const addLabs = isActive ? () => gate('documents', () => open('M-5.3')) : undefined;

  let list: ReactNode;
  if (loading) {
    list = <p className={styles.loading}>Loading…</p>;
  } else if (tab === 'images') {
    list = <AttachmentsGallery profileId={profileId} query={q} captions />;
  } else {
    list =
      filteredLabs.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState
            icon="labs"
            title={q ? 'No labs match that search' : 'No lab results yet'}
            actionLabel={addLabs && !q ? 'Add labs' : undefined}
            actionIcon="plus"
            onAction={addLabs}
          />
        </div>
      ) : (
        <>
          <ul className={styles.cards}>
            {filteredLabs.map((r) => (
              <li key={r.id}>
                <VisitNoteCard
                  doodle="file"
                  date={
                    r.collectedAt
                      ? new Date(r.collectedAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Date not set'
                  }
                  title={r.panelTitle || r.labName || 'Lab results'}
                  detail={[
                    r.labName,
                    `${r.values.length} ${r.values.length === 1 ? 'result' : 'results'}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  selected={wide && labId === r.id}
                  onOpen={() => openLab(r.id)}
                />
              </li>
            ))}
          </ul>
        </>
      );
  }

  const detail =
    wide && tab === 'labs' && labId ? (
      <DetailHostProvider
        screenId="M-9.5"
        params={{ reportId: labId }}
        previousTitle="Attachments"
        onClear={() => setLabId(null)}
      >
        <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
          <LabReport />
        </Suspense>
      </DetailHostProvider>
    ) : undefined;

  return (
    <DerivedPage
      title="Attachments"
      // Desktop layout (design 2026-10-27): title alone; tabs left and the tab's Add action right, one row.
      // OPEN: search removed while lists are short — bring back past ~10–15 items per tab?
      tabs={
        <div className={styles.filters}>
          <div className={styles.tabs}>
            <Segmented
              label="Attachment type"
              options={TABS}
              value={tab}
              onChange={(t) => {
                setTab(t);
                setLabId(null);
              }}
            />
          </div>
          {/* OPEN: no add-images flow yet, so the Images tab has no add action. */}
          {tab === 'labs' && addLabs && (
            <Button leadingIcon="plus" onClick={addLabs}>
              Add labs
            </Button>
          )}
        </div>
      }
      split={wide && tab === 'labs' && Boolean(labId)}
      detail={detail}
      composerPlaceholder="Ask Oracle about an attachment…"
    >
      <div className={styles.stack}>{list}</div>
    </DerivedPage>
  );
}
