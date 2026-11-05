/** @ui DataTable — roomy surface table: canvas header, hairline rows, icon sort,
 *  optional footer. Clickable rows highlight on hover. Wide tables scroll inline inside their own container; the header stays sticky. */
import { useMemo, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import { HeaderCell, TableMenu } from './parts/HeaderCell';
import { Pager } from './parts/Pager';
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
  /** Supporting detail (dates, who, counts): lighter and slightly smaller so the row's main facts lead. */
  muted?: boolean;
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
  /** `plain`: no box, no header fill; rows sit straight on the page (used inside drawers). */
  variant?: 'boxed' | 'plain';
  /** Rows per page to start with (boxed tables only). Plain tables in drawers never page. */
  pageSize?: number;
  /** false: no pager bar, every row shows (short fixed lists such as plans). */
  paginate?: boolean;
}

/** Puts several bits of content in one cell on a shared centre line (e.g. a name and a status pill). */
export function CellRow({ children }: { children: ReactNode }) {
  return <span className={styles.inline}>{children}</span>;
}

export function DataTable<T>({ label, columns, rows, rowKey, onRowClick, empty, emptyIcon = 'search', initialSort, footer, variant = 'boxed', pageSize = 25, paginate = true }: DataTableProps<T>) {
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

  const paged = variant === 'boxed' && paginate;
  const [size, setSize] = useState(pageSize);
  const [pageWanted, setPage] = useState(0);
  // Filtering can shrink the list under the current page; show the last one that exists.
  const lastPage = Math.max(0, Math.ceil(rows.length / size) - 1);
  const page = Math.min(pageWanted, lastPage);
  const visible = paged ? sorted.slice(page * size, (page + 1) * size) : sorted;

  const sortable = columns.filter((c) => c.sort);
  const sortBy = (key: string, dir: 'asc' | 'desc' | undefined) => setSort(dir ? { key, dir } : undefined);

  if (rows.length === 0) {
    return (
      <div className={styles.empty} data-variant={variant}>
        <span className={styles.emptyIcon}><Icon name={emptyIcon} size={22} /></span>
        <p className={styles.emptyText}>{empty ?? 'Nothing here yet.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container} data-variant={variant}>
      {paged && <Pager page={page} size={size} total={rows.length} onPage={setPage} onSize={(n) => { setSize(n); setPage(0); }} summary={footer} />}
      <div className={styles.scroll}>
        <table className={styles.table} aria-label={label}>
          <thead>
            <tr>
              {columns.map((c, i) => {
                const last = i === columns.length - 1;
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    data-align={c.align}
                    data-grow={c.grow || undefined}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span className={styles.headCell}>
                      {c.sort ? <HeaderCell header={c.header} dir={active ? sort.dir : undefined} onSort={(dir) => sortBy(c.key, dir)} /> : c.header}
                      {last && sortable.length > 0 && (
                        <TableMenu columns={sortable} sort={sort} onSort={(key, dir) => setSort(key && dir ? { key, dir } : undefined)} />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                className={onRowClick ? styles.clickable : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} data-align={c.align} data-grow={c.grow || undefined} data-primary={c.primary || undefined} data-muted={c.muted || undefined}>{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && !paged && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
