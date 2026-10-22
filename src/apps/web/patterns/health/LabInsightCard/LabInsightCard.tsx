/**
 * LabInsightCard — personalized summary on M-9.5 (Immunity/Inflammation reference).
 * Plain text + Show more; no status pills. Clinical copy is placeholder unless approved.
 */
import { useState } from 'react';
import { Icon } from '@web/ui';
import styles from './LabInsightCard.module.css';

export interface LabInsightCardProps {
  headline: string;
  body: string;
  /** Truncate until expanded. */
  collapsedLines?: number;
}

export function LabInsightCard({ headline, body }: LabInsightCardProps) {
  const [open, setOpen] = useState(false);
  const long = body.length > 120;
  return (
    <section className={styles.root} aria-label="Lab summary" data-placeholder>
      <h2 className={styles.headline}>{headline}</h2>
      <p className={styles.body} data-expanded={open || !long || undefined}>
        {body}
      </p>
      {long && (
        <button type="button" className={styles.more} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? 'Show less' : 'Show more'}
          <span className={open ? styles.up : undefined} aria-hidden>
            <Icon name="chevronDown" size={16} />
          </span>
        </button>
      )}
    </section>
  );
}
