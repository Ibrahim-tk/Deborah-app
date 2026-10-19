/**
 * @pattern ReportRow — a saved report: Visit summary (provider brief) or Saved guidance, with date.
 * @usedBy  M-11.1 (Saved Reports)
 * @spec    docs/ux/F11-documents.md#m-111--documents-and-reports
 * @xref    web: apps/web/patterns/health/ReportRow — not built
 */
import { Icon, ListRow } from '@mobile/ui';
import styles from '../DocumentRow/DocumentRow.module.css';

export type ReportKind = 'visit-summary' | 'saved-guidance';

export interface ReportRowProps {
  title: string;
  kind: ReportKind;
  /** Already formatted, e.g. "17 Oct". */
  updated: string;
  onPress: () => void;
}

const LABEL: Record<ReportKind, string> = { 'visit-summary': 'Visit summary', 'saved-guidance': 'Saved guidance' };

export function ReportRow({ title, kind, updated, onPress }: ReportRowProps) {
  return (
    <ListRow
      title={<span className={styles.title}>{title}</span>}
      subtitle={`${LABEL[kind]} · ${updated}`}
      leading={
        <span className={styles.icon} aria-hidden>
          <Icon name={kind === 'visit-summary' ? 'pdf' : 'chat'} size={22} />
        </span>
      }
      onPress={onPress}
    />
  );
}
