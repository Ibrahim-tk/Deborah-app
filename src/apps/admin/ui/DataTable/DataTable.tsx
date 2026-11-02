/** @ui DataTable — roomy surface table: canvas header, hairline rows, icon sort, chevron on clickable rows,
 *  optional footer. Wide tables scroll inline inside their own container; the header stays sticky. */
import { useMemo, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Value used to sort this column; omit to make it unsortable. */
  sort?: (row: T) => string | number;
  align?: 'start' | 'end';
  /** Lets this column take the spare width. */
  grow?: boolean;
  /** The row's identifying column: ink, medium weight. Others read secondary. */
  primary?: boolean;
}

export interface DataTableProps<T> {
  label: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  emptyIcon?: IconName;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  /** Shown under the rows, e.g. "Showing 8 of 24". */
  footer?: ReactNode;
}

export function DataTable<T>({ label, columns, rows, rowKey, onRowClick, empty, emptyIcon = 'search', initialSort, footer }: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort);
  const sorted = useMemo(() => {
    const by = columns.find((c) => c.key === sort?.key)?.sort;
    if (!by || !sort) return rows;
    return [...rows].sort((a, b) => {
      const x = by(a), y = by(b);
      const r = x < y ? -1 : x > y ? 1 : 0;
      return sort.dir === 'asc' ? r : -r;
    });
  }, [rows, columns, sort]);

  const toggle = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  if (rows.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}><Icon name={emptyIcon} size={22} /></span>
        <p className={styles.emptyText}>{empty ?? 'Nothing here yet.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scroll}>
        <table className={styles.table} aria-label={label}>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    data-align={c.align}
                    data-grow={c.grow || undefined}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {c.sort ? (
                      <button type="button" className={styles.sortBtn} data-active={active || undefined} onClick={() => toggle(c.key)}>
                        {c.header}
                        <span className={styles.arrow} data-dir={active ? sort.dir : undefined} aria-hidden>
                          <Icon name="chevron" size={14} />
                        </span>
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {onRowClick && <th aria-hidden className={styles.chevCol} />}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={rowKey(row)}
                className={onRowClick ? styles.clickable : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} data-align={c.align} data-primary={c.primary || undefined}>{c.render(row)}</td>
                ))}
                {onRowClick && (
                  <td className={styles.chevCol} aria-hidden>
                    <Icon name="chevron" size={16} className={styles.chev} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
