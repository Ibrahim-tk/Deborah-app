/**
 * PrimaryIntentCard — Home hero for continue / complete-profile / start-with-Deborah.
 */
import type { ReactNode } from 'react';
import { cx } from '@shared/utils';
import { Icon, type IconName } from '@web/ui';
import styles from './PrimaryIntentCard.module.css';

export interface PrimaryIntentCardProps {
  tone?: 'lilac' | 'linen' | 'lift';
  titleId: string;
  title: string;
  body?: string;
  kicker?: string;
  kickerIcon?: IconName;
  pending?: string;
  leading?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PrimaryIntentCard({
  tone = 'lilac',
  titleId,
  title,
  body,
  kicker,
  kickerIcon,
  pending,
  leading,
  children,
  className,
}: PrimaryIntentCardProps) {
  const text = (
    <div className={styles.text}>
      {kicker && (
        <p className={styles.kicker}>
          {kickerIcon && <Icon name={kickerIcon} size={16} />}
          {kicker}
        </p>
      )}
      <h2 id={titleId} className={styles.title}>{title}</h2>
      {body && <p className={styles.body}>{body}</p>}
    </div>
  );

  return (
    <section className={cx(styles.root, styles[tone], className)} aria-labelledby={titleId}>
      {leading ? (
        <div className={styles.head}>
          {leading}
          {text}
        </div>
      ) : (
        text
      )}
      {pending && <p className={styles.pending}>Next: “{pending}”</p>}
      {children}
    </section>
  );
}
