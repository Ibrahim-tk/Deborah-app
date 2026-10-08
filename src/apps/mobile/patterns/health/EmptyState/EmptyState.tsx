/**
 * @pattern EmptyState — designed empty list: title-2 invitation, one line of callout, one primary
 *          button (DESIGN.md › Other controls › Empty states)
 *          (docs/ux/00-ux-overview.md §3: every list has an empty state with a next action)
 * @usedBy  M-7.1, M-9.1, M-7.5 (no results)
 * @spec    docs/ux/F07-my-health-hub.md, docs/ux/F09-records.md
 * @xref    web: apps/web/patterns/health/EmptyState — not built
 */
import type { ReactNode } from 'react';
import { Button, Icon, type IconName } from '@mobile/ui';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: IconName;
  title?: string;
  text?: ReactNode;
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
}

export function EmptyState({ icon, title, text, actionLabel, actionIcon, onAction }: EmptyStateProps) {
  return (
    <div className={styles.root}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={28} />
        </span>
      )}
      {title && <h2 className={styles.title}>{title}</h2>}
      {text && <p className={styles.text}>{text}</p>}
      {actionLabel && onAction && (
        <Button size="md" leadingIcon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
