/** @pattern FiltersPopover — less-used filters tucked behind one "Filters" button (shows how many are on), so the
 *  toolbar keeps only the common controls. Children are the filter fields. */
import { useState, type ReactNode } from 'react';
import { Button, Popover } from '@admin/ui';
import styles from './FiltersPopover.module.css';

export function FiltersPopover({ active, onClear, children }: { active: number; onClear: () => void; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="More filters"
      align="start"
      trigger={<Button variant="secondary" leadingIcon="menu">{active ? `Filters (${active})` : 'Filters'}</Button>}
    >
      <div className={styles.panel}>
        {children}
        <div className={styles.foot}>
          <Button variant="ghost" size="sm" disabled={!active} onClick={onClear}>Clear filters</Button>
          <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </div>
    </Popover>
  );
}
