/** @pattern FilterBar — search leads, filters trail; wraps on narrow widths. */
import type { ReactNode } from 'react';
import { Icon, Input } from '@admin/ui';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
  children?: ReactNode;
  /** Filters sit right after the search instead of on the trailing edge. */
  inline?: boolean;
}

export function FilterBar({ query, onQuery, placeholder, children, inline }: FilterBarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.search}>
        <Input
          label="Search"
          hideLabel
          variant="search"
          type="search"
          value={query}
          placeholder={placeholder}
          leading={<Icon name="search" size={18} />}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>
      {children && <div className={styles.filters} data-inline={inline || undefined}>{children}</div>}
    </div>
  );
}
