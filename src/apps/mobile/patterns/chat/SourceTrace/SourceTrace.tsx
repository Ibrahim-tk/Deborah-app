/**
 * @pattern SourceTrace — quiet disclosure above a grounded answer: "Read your lab report · Mar 12 ✓".
 *          Opens to the values Deborah actually used and an "Open report" link. Renders only when an
 *          answer drew on the user's own records; every other answer looks unchanged.
 * @usedBy  M-2.1 (MessageList) · M-9.3 transcript (ConsultationDetail)
 * @spec    design direction 2026-10-21 (tool-call transparency, client-friendly)
 * @xref    web: apps/web/patterns/chat/SourceTrace — not built
 * OPEN: "Uploaded documents and visit notes — wire now or labs only?" Default: labs only; `kind` is ready for more.
 */
import { useId, useState } from 'react';
import { Icon } from '@mobile/ui';
import styles from './SourceTrace.module.css';

export interface SourceTraceItem {
  label: string;
  value: string;
}

export interface SourceTraceProps {
  kind?: 'lab' | 'document' | 'visitNotes';
  /** e.g. "Read your lab report". */
  title: string;
  /** Short date shown after a dot, e.g. "Mar 12". */
  date?: string;
  items: SourceTraceItem[];
  /** "Open report" link; hidden when absent (e.g. read-only transcript). */
  onOpen?: () => void;
  openLabel?: string;
}

const ICON = { lab: 'labs', document: 'file', visitNotes: 'note' } as const;

export function SourceTrace({ kind = 'lab', title, date, items, onOpen, openLabel = 'Open report' }: SourceTraceProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className={styles.root} data-open={open || undefined}>
      <button type="button" className={styles.row} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <span className={styles.chevron} aria-hidden><Icon name="chevron" size={14} /></span>
        <span className={styles.kind} aria-hidden><Icon name={ICON[kind]} size={16} /></span>
        <span className={styles.title}>
          {title}
          {date && <span className={styles.date}> · {date}</span>}
        </span>
        <svg className={styles.tick} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="Done" role="img">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
        </svg>
      </button>
      <div id={panelId} className={styles.panel} role="region" aria-label={title} hidden={!open}>
        <div className={styles.inner}>
          <ul className={styles.items}>
            {items.map((it) => (
              <li key={it.label} className={styles.item}>
                <span>{it.label}</span>
                <span className={styles.value}>{it.value}</span>
              </li>
            ))}
          </ul>
          {onOpen && (
            <button type="button" className={styles.open} onClick={onOpen}>
              {openLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

