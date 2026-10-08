/**
 * @screen  M-9.5 · Lab report
 * @flow    F09 My Health records (read mode of F05's M-5.4 layout)
 * @states  default · overflow menu · delete confirm · other profile (no Ask) · not found
 * @figma   NOT IN WIREFRAMES
 * @spec    docs/ux/F09-records.md#m-95--lab-report-not-in-wireframes
 * @xref    web: W-9.5 (apps/web/screens/records/LabReport) — not built
 */
import { useState } from 'react';
import { useAppStore } from '@shared/store';
import type { LabReport as Report } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { ActionSheet, Button, Header, IconButton, useAlert } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useConversation } from '@mobile/hooks/useConversation';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import { LabValueList } from './parts/LabValueList';
import styles from './LabReport.module.css';

const SOURCE: Record<Report['source'], string> = { photo: 'Photo of your report', pdf: 'PDF upload', manual: 'Entered by hand' };

export default function LabReport() {
  const { reportId = '' } = useScreenParams<{ reportId: string }>();
  const { pop, open, returnToConversation } = useNav();
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
  const [menu, setMenu] = useState(false);
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
    chat.shareLabs(report);
  };

  const meta = [
    { label: 'Lab', value: report.labName || 'Not given' },
    { label: 'Collection date', value: report.collectedAt ? formatShortDate(report.collectedAt) : 'Not given' },
    { label: 'Source', value: SOURCE[report.source] },
  ];

  return (
    <div className={styles.root} data-xref="M-9.5 · Lab report">
      <Header
        title={report.labName || 'Lab report'}
        onBack={back}
        backLabel={previousTitle}
        right={<IconButton icon="more" label="More options" onClick={() => setMenu(true)} />}
      />
      <div className={styles.body}>
        <dl className={styles.meta}>
          {meta.map((m) => (
            <div key={m.label} className={styles.metaRow}>
              <dt className={styles.muted}>{m.label}</dt>
              <dd className={styles.metaValue}>{m.value}</dd>
            </div>
          ))}
        </dl>
        <section className={styles.section}>
          <h2 className={styles.heading}>{`Values (${report.values.length})`}</h2>
          <LabValueList values={report.values} />
        </section>
        <p className={styles.muted}>These are the values you confirmed. Deborah explains them; she doesn’t diagnose.</p>
      </div>
      {isActiveProfile && (
        <div className={styles.footer}>
          <Button fullWidth leadingIcon="deborah" onClick={ask}>Ask Deborah about these labs</Button>
        </div>
      )}
      <ActionSheet
        open={menu}
        actions={[
          { label: 'Edit', onSelect: () => open('M-5.4', { mode: 'edit', reportId: report.id }) },
          { label: 'Delete', destructive: true, onSelect: remove },
        ]}
        onClose={() => setMenu(false)}
      />
    </div>
  );
}
