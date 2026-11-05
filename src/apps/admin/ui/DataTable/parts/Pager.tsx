/** Gmail-style pager over the table: rows-per-page choice, "1–25 of 120", previous / next. */
import type { ReactNode } from 'react';
import { IconButton } from '../../IconButton';
import { Select } from '../../Select';
import styles from '../DataTable.module.css';

const PAGE_SIZES = ['10', '20', '25', '50'] as const;

interface PagerProps {
  page: number;
  size: number;
  total: number;
  onPage: (p: number) => void;
  onSize: (s: number) => void;
  /** The table's summary line (e.g. "Showing 9 of 9 entries"), shown on the leading edge. */
  summary?: ReactNode;
}

export function Pager({ page, size, total, onPage, onSize, summary }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : page * size + 1;
  const to = Math.min(total, (page + 1) * size);
  return (
    <div className={styles.pager}>
      {summary && <span className={styles.pagerSummary}>{summary}</span>}
      <span className={styles.pagerLabel}>Rows per page</span>
      <Select
        label="Rows per page"
        hideLabel
        size="sm"
        value={String(size) as (typeof PAGE_SIZES)[number]}
        onChange={(v) => onSize(Number(v))}
        options={PAGE_SIZES.map((v) => ({ value: v, label: v }))}
      />
      <span className={styles.pagerRange}>{from}–{to} of {total}</span>
      <IconButton icon="back" size="sm" label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} />
      <IconButton icon="chevron" size="sm" label="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} />
    </div>
  );
}
