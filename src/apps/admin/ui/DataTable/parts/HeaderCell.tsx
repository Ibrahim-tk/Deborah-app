/** Column header in the MUI data-grid style: click the label to cycle ascending → descending → off;
 *  an arrow shows the direction (faint on hover when unsorted); a ⋮ column menu offers the same choices. */
import { Icon } from '../../Icon';
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
    <span className={styles.headCell}>
      <button type="button" className={styles.sortBtn} data-active={dir ? '' : undefined} onClick={() => onSort(next(dir))}>
        {header}
        <span className={styles.arrow} data-dir={dir} aria-hidden>
          <Icon name="sortArrow" size={14} />
        </span>
      </button>
      <span className={styles.columnMenu}>
        <Menu
          side="bottom"
          align="start"
          onSelect={(id) => onSort(id === 'asc' || id === 'desc' ? id : undefined)}
          items={[
            { id: 'asc', label: 'Sort ascending' },
            { id: 'desc', label: 'Sort descending' },
            ...(dir ? [{ id: 'none', label: 'Unsort' }] : []),
          ]}
          trigger={<IconButton icon="columnMenu" size="sm" label={`${header} column menu`} />}
        />
      </span>
    </span>
  );
}
