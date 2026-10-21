/**
 * @screen  M-9.5 · Lab report
 * @flow    F09 My Health records (read mode of F05's M-5.4 layout)
 * @states  default (preview · name · value tile grid) · edit (M-9.11 modal) · overflow menu · delete confirm · other profile (no Ask) · not found
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09-records.md#m-95--lab-report-not-in-wireframes
 * @xref    web: W-9.5 (apps/web/screens/records/LabReport) — not built
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import { formatShortDate } from '@shared/utils';
import { Button, Header, IconButton, Menu, useAlert } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useConversation } from '@mobile/hooks/useConversation';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { LabValueGrid } from './parts/LabValueGrid';
import { LabPreview } from './parts/LabPreview';
import styles from './LabReport.module.css';

export default function LabReport() {
  const { reportId = '' } = useScreenParams<{ reportId: string }>();
  const { pop, returnToConversation, open } = useNav();
  const { previousTitle, canGoBack } = useRoute();
  const chat = useConversation();
  const alert = useAlert();
  const toast = useToast();
  const live = useAppStore((s) => s.labs.reportsById[reportId]);
  // Keep the last version on screen while the pop animates out after Delete.
  const [kept, setKept] = useState(live);
  if (live && live !== kept) setKept(live);
  const report = live ?? kept;
  const isActiveProfile = useAppStore((s) => s.activeProfileId === report?.profileId);
  const back = canGoBack ? pop : undefined;

  if (!report) {
    return (
      <div className={styles.root} data-xref="M-9.5 · Lab report">
        <Header title="Lab report" onBack={back} backLabel={previousTitle} />
        <div className={styles.body}>
          <EmptyState icon="labs" text="This lab report is no longer available." actionLabel="Back to records" onAction={pop} />
        </div>
      </div>
    );
  }

  const remove = async () => {
    const choice = await alert({
      title: 'Delete these lab results?',
      message: 'They will be removed from your records. This can’t be undone.',
      buttons: [{ label: 'Cancel', style: 'cancel' }, { label: 'Delete', style: 'destructive' }],
    });
    if (choice !== 1) return;
    pop();
    useAppStore.getState().deleteReport(report.id);
    toast('Lab results deleted');
  };

  const ask = () => {
    returnToConversation();
    chat.shareLabs(report, { direct: true });
  };

  const title = report.panelTitle || report.labName || 'Lab report';

  return (
    <div className={styles.root} data-xref="M-9.5 · Lab report">
      <Header
        onBack={back}
        backLabel={previousTitle}
        right={
          <>
            <IconButton icon="info" label="About these results" onClick={() => toast('Educational results only — not a diagnosis.')} />
            {/* Overflow: an inline dropdown under the button (Base UI Menu), not an action sheet (design 2026-10-20). */}
            <Menu
              side="bottom"
              align="end"
              trigger={<IconButton icon="more" label="More options" />}
              items={[{ id: 'edit', label: 'Edit', icon: 'edit' }, { id: 'delete', label: 'Delete', icon: 'delete', destructive: true }]}
              onSelect={(id) => (id === 'edit' ? open('M-9.11', { reportId: report.id }) : remove())}
            />
          </>
        }
      />
      <div className={styles.body}>
        {/* Preview in the middle, then the panel's name, then the values (design direction 2026-10-20). */}
        <LabPreview report={report} />
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.sub}>
            {/* Placeholder lab names ("Sample Lab") are left out; the date stands alone. */}
            {[report.labName && !/^sample\b/i.test(report.labName) ? report.labName : undefined, report.collectedAt ? formatShortDate(report.collectedAt) : undefined].filter(Boolean).join(' · ') || 'Your lab report'}
          </p>
        </div>
        <LabValueGrid title="Your results" values={report.values} />

      </div>
      {isActiveProfile && (
        <div className={styles.footer}>
          <Button fullWidth leadingIcon="deborah" onClick={ask}>Ask Deborah about these labs</Button>
        </div>
      )}
    </div>
  );
}
