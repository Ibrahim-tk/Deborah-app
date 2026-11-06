/** @pattern FilterBar — search leads, category filters follow it, an optional trailing control (Sort) sits on the far
 *  right; wraps on narrow widths. Search updates after a short pause (about 300 ms) so the table doesn't flicker. */
import { useRef, useState, type ReactNode } from 'react';
import { Icon, Input } from '@admin/ui';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
  children?: ReactNode;
  /** Filters sit right after the search instead of on the trailing edge. */
  inline?: boolean;
  /** Far-right control, kept apart from the filters (e.g. Sort). */
  trailing?: ReactNode;
}

export function FilterBar({ query, onQuery, placeholder, children, inline, trailing }: FilterBarProps) {
  // Local text so typing feels instant; the table follows after the pause. A cleared/reset query resyncs it.
  const [text, setText] = useState(query);
  const [synced, setSynced] = useState(query);
  if (query !== synced) {
    setSynced(query);
    setText(query);
  }
  const timer = useRef<number | undefined>(undefined);
  const type = (v: string) => {
    setText(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onQuery(v), 300);
  };

  return (
    <div className={styles.root}>
      <div className={styles.search}>
        <Input
          label="Search"
          hideLabel
          variant="search"
          type="search"
          value={text}
          placeholder={placeholder}
          leading={<Icon name="search" size={18} />}
          onChange={(e) => type(e.target.value)}
        />
      </div>
      {children && <div className={styles.filters} data-inline={inline || undefined}>{children}</div>}
      {trailing && <div className={styles.trailing}>{trailing}</div>}
    </div>
  );
}
