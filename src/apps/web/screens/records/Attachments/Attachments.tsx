/**
 * @screen  M-9.12 · Attachments (web)
 * @flow    F09 / F11 — labs, saved reports, and images
 * @states  labs · reports · images · search · empty · wide master–detail
 * @spec    web derived-pages shell
 * @xref    web: W-9.12 (apps/web/screens/records/Attachments)
 */
import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectProfileLabs, selectSavedReports, useAppStore } from '@shared/store';
import type { Note } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
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

type Tab = 'labs' | 'reports' | 'images';

const TABS: { value: Tab; label: string }[] = [
  { value: 'labs', label: 'Labs' },
  { value: 'reports', label: 'Reports' },
  { value: 'images', label: 'Images' },
];

export default function Attachments() {
  const params = useScreenParams<{ tab: Tab; profileId: string }>();
  const { open } = useNav();
  const gate = useAccountGate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const profileId = params.profileId ?? activeProfileId;
  const labs = useAppStore(useShallow((s) => selectProfileLabs(s, profileId)));
  const reports = useAppStore(useShallow((s) => selectSavedReports(s, profileId)));
  const [tab, setTab] = useState<Tab>(params.tab === 'reports' || params.tab === 'images' ? params.tab : 'labs');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [labId, setLabId] = useState<string | null>(null);
  const wide = useWideSplit();
  const { setClientGuide } = useDevice();
  const q = query.trim().toLowerCase();
  const isActive = profileId === activeProfileId;

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simBetween(300, 600));
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setClientGuide(tab === 'labs' ? 'records-labs' : tab === 'images' ? 'records-attachments' : 'records-notes');
    return () => setClientGuide(null);
  }, [tab, setClientGuide]);

  useEffect(() => {
    setLabId(null);
  }, [tab, profileId]);

  const filteredLabs = useMemo(
    () =>
      labs.filter((r) => {
        if (!q) return true;
        return `${r.panelTitle ?? ''} ${r.labName ?? ''}`.toLowerCase().includes(q);
      }),
    [labs, q],
  );

  const filteredReports = useMemo(
    () =>
      reports.filter((n) => {
        if (!q) return true;
        return `${n.title} ${n.body}`.toLowerCase().includes(q);
      }),
    [reports, q],
  );

  const openLab = (id: string) => {
    if (wide) setLabId(id);
    else open('M-9.5', { reportId: id });
  };

  const openReport = (n: Note) => {
    if (n.kind === 'provider-brief') open('M-9.6', { briefNoteId: n.id });
    else if (n.sourceMessageId) open('M-9.6', { messageId: n.sourceMessageId });
    else open('M-9.4', { noteId: n.id });
  };

  const addLabs = isActive ? () => gate('documents', () => open('M-5.3')) : undefined;

  let list: ReactNode;
  if (loading) {
    list = <p className={styles.loading}>Loading…</p>;
  } else if (tab === 'images') {
    list = <AttachmentsGallery profileId={profileId} query={q} captions />;
  } else if (tab === 'labs') {
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
                      ? new Date(r.collectedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                      : 'Date not set'
                  }
                  title={r.panelTitle || r.labName || 'Lab results'}
                  detail={[r.labName, `${r.values.length} ${r.values.length === 1 ? 'result' : 'results'}`].filter(Boolean).join(' · ')}
                  selected={wide && labId === r.id}
                  onOpen={() => openLab(r.id)}
                />
              </li>
            ))}
          </ul>
          {addLabs && !q && (
            <Button className={styles.fab} leadingIcon="plus" onClick={addLabs}>
              Add labs
            </Button>
          )}
        </>
      );
  } else {
    list =
      filteredReports.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState
            icon="pdf"
            title={q ? 'No reports match that search' : 'No saved reports yet'}
            text={q ? undefined : 'Visit summaries and guidance you save from Deborah appear here.'}
          />
        </div>
      ) : (
        <ul className={styles.cards}>
          {filteredReports.map((n) => (
            <li key={n.id}>
              <VisitNoteCard
                doodle="pdf"
                date={formatShortDate(n.updatedAt)}
                title={n.title || (n.kind === 'provider-brief' ? 'For my provider' : 'Saved guidance')}
                detail={n.body.split('\n').find((l) => l.trim())?.trim()}
                onOpen={() => openReport(n)}
              />
            </li>
          ))}
        </ul>
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
      tabs={<Segmented label="Attachment type" options={TABS} value={tab} onChange={setTab} />}
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={tab === 'labs' ? 'Search labs' : tab === 'reports' ? 'Search reports' : 'Search images'}
      split={wide && tab === 'labs' && Boolean(labId)}
      detail={detail}
      composerPlaceholder="Ask Deborah about an attachment…"
    >
      <div className={styles.stack}>{list}</div>
    </DerivedPage>
  );
}
