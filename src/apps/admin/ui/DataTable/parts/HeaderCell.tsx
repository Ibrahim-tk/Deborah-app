/** Column header in the MUI data-grid style: click the label to cycle ascending → descending → off; no arrow.
 *  One table-wide ⋮ menu (TableMenu) sits after the last header and offers the same choices for every column. */
import { IconButton } from '../../IconButton';
import { Menu } from '../../Menu';
import styles from '../DataTable.module.css';

export type SortDir = 'asc' | 'desc';

export interface HeaderCellProps {
  header: string;
  dir?: SortDir;
  onSort: (dir: SortDir | undefined) => void;
}

const next = (dir?: SortDir): SortDir | undefined => (dir === undefined ? 'asc' : dir === 'asc' ? 'desc' : undefined);

export function HeaderCell({ header, dir, onSort }: HeaderCellProps) {
  return (
    <button type="button" className={styles.sortBtn} data-active={dir ? '' : undefined} onClick={() => onSort(next(dir))}>
      {header}
    </button>
  );
}

export interface TableMenuProps {
  columns: { key: string; header: string }[];
  sort?: { key: string; dir: SortDir };
  onSort: (key: string | undefined, dir?: SortDir) => void;
}

/** One line per sortable column. Picking the column already sorted flips its direction; the active one says which. */
export function TableMenu({ columns, sort, onSort }: TableMenuProps) {
  return (
    <span className={styles.columnMenu}>
      <Menu
        side="bottom"
        align="end"
        onSelect={(id) => {
          if (id === 'none') return onSort(undefined);
          onSort(id, sort?.key === id && sort.dir === 'asc' ? 'desc' : 'asc');
        }}
        items={[
          ...columns.map((c) => ({
            id: c.key,
            label: sort?.key === c.key ? `${c.header} (${sort.dir === 'asc' ? 'ascending' : 'descending'})` : c.header,
          })),
          ...(sort ? [{ id: 'none', label: 'Clear sort' }] : []),
        ]}
        trigger={<IconButton icon="columnMenu" size="sm" label="Sort by" />}
      />
    </span>
  );
}
