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
import { EmptyState, LabInsightCard, LabMetricCard } from '@mobile/patterns/health';
import { useConversation } from '@mobile/hooks/useConversation';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute, useScreenParams } from '@mobile/navigation';
import styles from './LabReport.module.css';

const SOURCE: Record<Report['source'], string> = { photo: 'Photo of your report', pdf: 'PDF upload', manual: 'Entered by hand' };

function insightCopy(report: Report, name: string) {
  const raw = report.insight;
  if (!raw) {
    return {
      headline: `${name}, here are the values you confirmed from this report.`,
      body: `Collected ${report.collectedAt ? formatShortDate(report.collectedAt) : 'recently'} · ${SOURCE[report.source]}. Deborah explains these; she doesn’t diagnose.`,
    };
  }
  return {
    headline: raw.headline.replace(/\{name\}/gi, name),
    body: raw.body,
  };
}

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
  const profileName = useAppStore((s) => {
    const id = report?.profileId ?? s.activeProfileId;
    return s.profiles.byId[id]?.name?.split(' ')[0] || 'there';
  });
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
    chat.shareLabs(report, { direct: true });
  };

  const title = report.panelTitle || report.labName || 'Lab report';
  const insight = insightCopy(report, profileName);

  return (
    <div className={styles.root} data-xref="M-9.5 · Lab report">
      <Header
        title={title}
        onBack={back}
        backLabel={previousTitle}
        right={
          <>
            <IconButton icon="info" label="About these results" onClick={() => toast('Educational results only — not a diagnosis.')} />
            <IconButton icon="more" label="More options" onClick={() => setMenu(true)} />
          </>
        }
      />
      <div className={styles.body}>
        <LabInsightCard headline={insight.headline} body={insight.body} />

        <ul className={styles.metrics}>
          {report.values.map((v) => (
            <li key={v.id}>
              <LabMetricCard
                value={v}
                onPress={() => open('M-5.4', { mode: 'edit', reportId: report.id })}
              />
            </li>
          ))}
        </ul>

        <p className={styles.muted}>
          {report.labName ? `${report.labName} · ` : ''}
          {report.collectedAt ? formatShortDate(report.collectedAt) : 'Date not given'}
          {' · '}
          These are the values you confirmed. Deborah explains them; she doesn’t diagnose.
        </p>
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
