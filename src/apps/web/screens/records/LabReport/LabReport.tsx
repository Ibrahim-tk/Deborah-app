/**
 * @screen  M-9.5 · Lab report
 * @flow    F09 My Health records (read mode of F05's M-5.4 layout)
 * @states  default (preview · name · value tile grid) · edit (M-9.11 modal) · overflow menu · delete confirm · other profile (no Ask) · not found
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09-records.md#m-95--lab-report-not-in-wireframes
 * @xref    web: W-9.5 (apps/web/screens/records/LabReport) — not built
 */
import { useState, type ReactNode } from 'react';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Button, IconButton, useAlert } from '@web/ui';
import { EmptyState } from '@web/patterns/health';
import { DerivedPage } from '@web/patterns/shell';
import { useConversation } from '@web/hooks/useConversation';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@web/navigation';
import { useDetailHost } from '../../DetailHost';
import { LabValueGrid } from './parts/LabValueGrid';
import { LabPreview } from './parts/LabPreview';
import styles from './LabReport.module.css';

export default function LabReport() {
  const { reportId = '' } = useScreenParams<{ reportId: string }>();
  const { pop, returnToConversation, open } = useNav();
  const { canGoBack } = useRoute();
  const detailHost = useDetailHost();
  const chat = useConversation();
  const alert = useAlert();
  const toast = useToast();
  const live = useAppStore((s) => s.labs.reportsById[reportId]);
  // Keep the last version on screen while the pop animates out after Delete.
  const [kept, setKept] = useState(live);
  const [showFull, setShowFull] = useState(false);
  if (live && live !== kept) setKept(live);
  const report = live ?? kept;
  const isActiveProfile = useAppStore((s) => s.activeProfileId === report?.profileId);
  const back = detailHost ? detailHost.clear : canGoBack ? pop : undefined;

  const wrap = (title: string, body: ReactNode, trailing?: ReactNode) =>
    detailHost ? (
      <div className={styles.embed} data-xref="M-9.5 · Lab report">
        {trailing && <div className={styles.actions}>{trailing}</div>}
        {body}
      </div>
    ) : (
      <DerivedPage
        title={title}
        trailing={trailing}
        composerPlaceholder="Ask Oracle about these labs…"
      >
        <div className={styles.stack} data-xref="M-9.5 · Lab report">
          {body}
        </div>
      </DerivedPage>
    );

  if (!report) {
    return wrap(
      'Lab report',
      <EmptyState
        icon="labs"
        text="This lab report is no longer available."
        actionLabel="Back to records"
        onAction={back ?? pop}
      />,
    );
  }

  const remove = async () => {
    const choice = await alert({
      title: 'Delete these lab results?',
      message: 'They will be removed from your records. This can’t be undone.',
      buttons: [
        { label: 'Cancel', style: 'cancel' },
        { label: 'Delete', style: 'destructive' },
      ],
    });
    if (choice !== 1) return;
    (back ?? pop)();
    useAppStore.getState().deleteReport(report.id);
    toast('Lab results deleted');
  };

  const ask = () => {
    returnToConversation();
    chat.shareLabs(report, { direct: true });
  };

  const title = report.panelTitle || report.labName || 'Lab report';

  const sub =
    [
      report.labName && !/^sample\b/i.test(report.labName) ? report.labName : undefined,
      report.collectedAt ? formatShortDate(report.collectedAt) : undefined,
    ]
      .filter(Boolean)
      .join(' · ') || 'Your lab report';

  // Standard detail header (design 2026-10-27): title once, actions on the right of it.
  const actions = (
    <div className={styles.headerActions}>
      <IconButton
        size="sm"
        icon="edit"
        label="Edit"
        onClick={() => open('M-9.11', { reportId: report.id })}
      />
      <IconButton size="sm" icon="delete" label="Delete" onClick={remove} />
      {isActiveProfile && (
        <Button className={styles.ask} leadingIcon="deborah" onClick={ask}>
          Ask Oracle
        </Button>
      )}
    </div>
  );

  return wrap(
    title,
    <>
      {/* Placeholder lab names ("Sample Lab") are left out; the date stands alone. */}
      <p className={styles.sub}>{sub}</p>
      {/* The original sits in a slim row; the results stay the main content. */}
      <button
        type="button"
        className={styles.original}
        aria-expanded={showFull}
        aria-label={showFull ? 'Hide original report' : 'View original report full size'}
        onClick={() => setShowFull((v) => !v)}
      >
        <LabPreview report={report} />
      </button>
      {showFull && (
        <div className={styles.full}>
          <LabPreview report={report} />
        </div>
      )}
      <LabValueGrid title="Your results" values={report.values} />
    </>,
    actions,
  );
}
