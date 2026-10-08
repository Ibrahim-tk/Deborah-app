/**
 * @pattern FocusCard — "Current focus: {topic}" · "From your consultation on {date}" · chevron
 * @usedBy  M-7.2
 * @spec    docs/ux/F07-my-health-hub.md#m-72--my-health-hub (Layout 2)
 * @xref    web: apps/web/patterns/health/FocusCard — not built
 */
import { Card, Icon } from '@mobile/ui';
import styles from './FocusCard.module.css';

export interface FocusCardProps {
  topic: string;
  /** Formatted date of the consultation the focus comes from. */
  dateLabel: string;
  /** Short summary of that consultation (optional second line). */
  summary?: string;
  /** Summary text comes from an unapproved script (shell › Highlight placeholder content). */
  placeholder?: boolean;
  onPress: () => void;
}

export function FocusCard({ topic, dateLabel, summary, placeholder, onPress }: FocusCardProps) {
  return (
    <Card onPress={onPress} className={styles.root}>
      <span className={styles.text}>
        {/* One line, as the spec phrases it — no eyebrow label above the heading (DESIGN.md › Don'ts). */}
        <span className={styles.topic}>Current focus: {topic}</span>
        {summary && <span className={styles.summary} data-placeholder={placeholder || undefined}>{summary}</span>}
        <span className={styles.meta}>From your consultation on {dateLabel}</span>
      </span>
      <Icon name="chevron" size={22} className={styles.chevron} />
    </Card>
  );
}
