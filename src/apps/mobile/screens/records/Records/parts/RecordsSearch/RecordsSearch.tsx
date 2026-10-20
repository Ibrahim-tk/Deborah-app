/**
 * Records search (design direction 2026-10-20): an overlay over the screen. The glass search button stretches
 * end to end into a field, the page behind dims so the field carries the emphasis, and results drop down under
 * the field as a floating panel — a short list. "See all" (or the keyboard's Search key) expands the same overlay
 * into a full results page in place: the veil turns solid and the panel grows to fill it, the field never moves.
 * The ✕ clears the text, or closes search when it's already empty; tapping the veil or Escape closes it too.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from '@mobile/ui';
import styles from './RecordsSearch.module.css';

export interface RecordsSearchProps {
  query: string;
  onChange: (q: string) => void;
  onClose: () => void;
  /** Expanded into the full results page. */
  expanded: boolean;
  onExpand: () => void;
  /** The results (list or full); shown only while there is a query. */
  children?: ReactNode;
}

export function RecordsSearch({ query, onChange, onClose, expanded, onExpand, children }: RecordsSearchProps) {
  const input = useRef<HTMLInputElement>(null);
  // Focus once the stretch has started, so the keyboard rises with it.
  useEffect(() => {
    const t = window.setTimeout(() => input.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, []);
  const clearOrClose = () => {
    if (!query) return onClose();
    onChange('');
    input.current?.focus();
  };
  return (
    <div className={styles.layer} data-expanded={expanded || undefined}>
      <div className={styles.scrim} onClick={expanded ? undefined : onClose} aria-hidden />
      <div className={styles.bar} role="search">
        <label className={styles.field}>
          <Icon name="search" size={18} className={styles.icon} />
          <input
            ref={input}
            className={styles.input}
            type="search"
            value={query}
            placeholder="Search notes and labs"
            aria-label="Search notes and labs"
            enterKeyHint="search"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && query.trim()) { e.preventDefault(); onExpand(); }
            }}
          />
          <button type="button" className={styles.clear} aria-label={query ? 'Clear search' : 'Close search'} onClick={clearOrClose}>
            <Icon name="close" size={14} />
          </button>
        </label>
        {query.trim() && <div className={styles.dropdown} role="region" aria-label="Search results">{children}</div>}
      </div>
    </div>
  );
}
