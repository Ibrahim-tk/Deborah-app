/**
 * @screen  M-11.1 · Documents and reports (web)
 * @flow    F11 Documents and reports
 * @states  loading · My Uploads · Saved Reports · empty · wide master–detail for uploads
 * @spec    docs/ux/F11-documents.md#m-111--documents-and-reports
 * @xref    mobile: apps/mobile/screens/documents/Library
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import { selectDocuments, useAppStore } from '@shared/store';
import { Button, Segmented, Skeleton, type IconName } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { simBetween } from '@web/hooks/simTiming';
import { useWideSplit } from '@web/hooks/useWideSplit';
import { useNav, useScreenParams } from '@web/navigation';
import { DetailHostProvider } from '../../DetailHost';
import { ProfileLine } from './parts/ProfileLine';
import { UploadsList } from './parts/UploadsList';
import { ReportsList } from './parts/ReportsList';
import styles from './Library.module.css';

type Tab = 'uploads' | 'reports';

const TABS: { value: Tab; label: string; icon: IconName }[] = [
  { value: 'uploads', label: 'My Uploads', icon: 'upload' },
  { value: 'reports', label: 'Saved Reports', icon: 'file' },
];

const DocumentPreview = lazy(() => import('../DocumentPreview'));

export default function Library() {
  const params = useScreenParams<{ tab: Tab; profileId: string }>();
  const { open, push } = useNav();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const profileId = params.profileId ?? activeProfileId;
  const hasDocs = useAppStore((s) => selectDocuments(s, profileId).length > 0);
  const [tab, setTab] = useState<Tab>(params.tab ?? 'uploads');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ scope: string; id: string } | null>(null);
  const wide = useWideSplit();
  const scope = `${profileId}:${tab}`;

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simBetween(300, 600));
    return () => window.clearTimeout(t);
  }, []);

  const paneId = wide && selected?.scope === scope ? selected.id : null;
  const upload = () => open('M-11.3', { profileId });

  const onSelectUpload = (documentId: string) => {
    if (wide) setSelected({ scope, id: documentId });
    else push('M-11.2', { documentId });
  };

  const splitUploads = wide && tab === 'uploads' && Boolean(paneId);

  const detail =
    splitUploads && paneId ? (
      <DetailHostProvider
        screenId="M-11.2"
        params={{ documentId: paneId }}
        previousTitle="Documents"
        onClear={() => setSelected((s) => (s?.scope === scope ? null : s))}
      >
        <Suspense fallback={<div className={styles.paneLoading}>Loading…</div>}>
          <DocumentPreview />
        </Suspense>
      </DetailHostProvider>
    ) : undefined;

  return (
    <DerivedPage
      title="Documents and reports"
      tabs={<Segmented label="Library" options={TABS} value={tab} onChange={setTab} />}
      split={splitUploads}
      detail={detail}
      composerPlaceholder="Ask Oracle about a document…"
    >
      <div className={styles.stack} data-xref="M-11.1 · Documents and reports">
        <ProfileLine profileId={profileId} switchable={!params.profileId} />
        {loading ? (
          <div className={styles.skeleton} aria-busy="true" aria-label="Loading documents">
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
        ) : tab === 'uploads' ? (
          <UploadsList
            profileId={profileId}
            onUpload={upload}
            selectedId={paneId}
            onSelect={wide ? onSelectUpload : undefined}
          />
        ) : (
          <ReportsList profileId={profileId} />
        )}
        {tab === 'uploads' && !loading && hasDocs && (
          <Button fullWidth leadingIcon="upload" onClick={upload}>
            Upload a document
          </Button>
        )}
      </div>
    </DerivedPage>
  );
}
