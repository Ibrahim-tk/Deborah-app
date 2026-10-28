/** Saved Reports: visit summaries and saved guidance, opened in the PDF preview (M-9.6). */
import { useShallow } from 'zustand/react/shallow';
import { selectSavedReports, useAppStore } from '@shared/store';
import type { Note } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { Divider } from '@web/ui';
import { EmptyState, ReportRow } from '@web/patterns/health';
import { useNav } from '@web/navigation';
import styles from './Lists.module.css';

export function ReportsList({ profileId }: { profileId: string }) {
  const { open } = useNav();
  const reports = useAppStore(useShallow((s) => selectSavedReports(s, profileId)));

  // Visit summary prints the stored brief; saved guidance prints the answer it came from.
  // OPEN: a saved-answer note without sourceMessageId has nothing to print — falls back to the note editor.
  const openReport = (n: Note) => {
    if (n.kind === 'provider-brief') open('M-9.6', { briefNoteId: n.id });
    else if (n.sourceMessageId) open('M-9.6', { messageId: n.sourceMessageId });
    else open('M-9.4', { noteId: n.id });
  };

  if (reports.length === 0) {
    return (
      <div className={styles.empty}>
        <EmptyState icon="pdf" title="No saved reports yet" text="Visit summaries and guidance you save from the Oracle appear here." />
      </div>
    );
  }
  return (
    <ul className={styles.list}>
      {reports.map((n) => (
        <li key={n.id}>
          <ReportRow
            title={n.title || (n.kind === 'provider-brief' ? 'For my provider' : 'Saved guidance')}
            kind={n.kind === 'provider-brief' ? 'visit-summary' : 'saved-guidance'}
            updated={formatShortDate(n.updatedAt)}
            onPress={() => openReport(n)}
          />
          <Divider />
        </li>
      ))}
    </ul>
  );
}
