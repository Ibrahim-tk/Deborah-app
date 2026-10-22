/**
 * LinkStatusCard — tonal status/link row for Home (Reports, Continue).
 * Color-field surface; flat IconWell; no stroke/shadow.
 */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, IconWell, type IconName } from '@web/ui';
import field from '../homeField.module.css';
import styles from './LinkStatusCard.module.css';

export type LinkTone = 'lilac' | 'linen' | 'rose';

export interface LinkStatusCardProps {
  tone: LinkTone;
  title: string;
  meta: string;
  extra?: ReactNode;
  icon?: IconName;
  lead?: IconName;
  onPress?: () => void;
  label?: string;
}

export function LinkStatusCard({ tone, title, meta, extra, icon = 'chevron', lead, onPress, label }: LinkStatusCardProps) {
  const body = (
    <>
      {lead && <IconWell icon={lead} />}
      <span className={field.text}>
        <span className={field.title}>{title}</span>
        <span className={field.meta}>{meta}</span>
        {extra}
      </span>
      <span className={field.action} aria-hidden>
        <Icon name={icon} size={18} />
      </span>
    </>
  );
  const cls = cx(styles.root, styles[tone]);
  return onPress ? (
    <button type="button" className={cls} onClick={onPress} aria-label={label}>{body}</button>
  ) : (
    <section className={cls} aria-label={label ?? title}>{body}</section>
  );
}
