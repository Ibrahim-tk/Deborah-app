/**
 * @screen  M-11.1 · Documents and reports
 * @flow    F11 Documents and reports
 * @states  loading (skeleton) · My Uploads · Saved Reports · each tab empty · other profile
 * @figma   — (NOT IN WIREFRAMES; Miro "Documents and Reports" 2026-10-19)
 * @spec    docs/ux/F11-documents.md#m-111--documents-and-reports
 * @xref    web: W-11.1 (apps/web/screens/documents/Library) — not built
 */
import { useEffect, useState } from 'react';
import { selectDocuments, useAppStore } from '@shared/store';
import { Button, Header, Segmented, Skeleton, type IconName } from '@mobile/ui';
import { simBetween } from '@mobile/hooks/simTiming';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { ProfileLine } from './parts/ProfileLine';
import { UploadsList } from './parts/UploadsList';
import { ReportsList } from './parts/ReportsList';
import styles from './Library.module.css';

type Tab = 'uploads' | 'reports';

const TABS: { value: Tab; label: string; icon: IconName }[] = [
  { value: 'uploads', label: 'My Uploads', icon: 'upload' },
  { value: 'reports', label: 'Saved Reports', icon: 'file' },
];

export default function Library() {
  const params = useScreenParams<{ tab: Tab; profileId: string }>();
  const { pop, open } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  // A passed profileId pins the view (Profile details); otherwise follow the active profile.
  const profileId = params.profileId ?? activeProfileId;
  const hasDocs = useAppStore((s) => selectDocuments(s, profileId).length > 0);
  const [tab, setTab] = useState<Tab>(params.tab ?? 'uploads');
  const [loading, setLoading] = useState(true);

  // Simulated first load (docs/ux/00-ux-overview.md §3: skeletons 300–600 ms).
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simBetween(300, 600));
    return () => window.clearTimeout(t);
  }, []);

  const upload = () => open('M-11.3', { profileId });

  return (
    <div className={styles.root} data-xref="M-11.1 · Documents and reports">
      <Header title="Documents and reports" onBack={canGoBack ? pop : undefined} backLabel={previousTitle} />
      <div className={styles.body}>
        <div className={styles.top}>
          <ProfileLine profileId={profileId} switchable={!params.profileId} />
          <Segmented label="Library" options={TABS} value={tab} onChange={setTab} />
        </div>
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
          <UploadsList profileId={profileId} onUpload={upload} />
        ) : (
          <ReportsList profileId={profileId} />
        )}
      </div>
      {/* The empty state carries its own Upload button, so the pinned one waits for a first document. */}
      {tab === 'uploads' && !loading && hasDocs && (
        <div className={styles.footer}>
          <Button fullWidth leadingIcon="upload" onClick={upload}>Upload a document</Button>
        </div>
      )}
    </div>
  );
}
