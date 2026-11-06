/** @pattern ChecklistFilter — one "Filters" button that opens checkbox groups (several values per group).
 *  Choices apply on Apply; Clear all empties every group. The button shows how many are ticked. */
import { useState } from 'react';
import { Button, Checkbox, Popover } from '@admin/ui';
import styles from './ChecklistFilter.module.css';

export interface ChecklistGroup {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface ChecklistFilterProps {
  groups: ChecklistGroup[];
  value: Record<string, string[]>;
  onApply: (value: Record<string, string[]>) => void;
}

export function ChecklistFilter({ groups, value, onApply }: ChecklistFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const count = Object.values(value).reduce((n, v) => n + v.length, 0);
  const toggle = (key: string, v: string, on: boolean) => {
    const cur = draft[key] ?? [];
    setDraft({ ...draft, [key]: on ? [...cur, v] : cur.filter((x) => x !== v) });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => { if (o) setDraft(value); setOpen(o); }}
      label="Filters"
      align="end"
      trigger={<Button variant="secondary" leadingIcon="menu">{count ? `Filters (${count})` : 'Filters'}</Button>}
    >
      <div className={styles.panel}>
        {groups.map((g) => (
          <fieldset key={g.key} className={styles.group}>
            <legend className={styles.legend}>{g.label}</legend>
            {g.options.map((o) => (
              <Checkbox key={o.value} label={o.label} checked={(draft[g.key] ?? []).includes(o.value)} onChange={(on) => toggle(g.key, o.value, on)} />
            ))}
          </fieldset>
        ))}
        <div className={styles.foot}>
          <Button variant="ghost" size="sm" onClick={() => setDraft({})}>Clear all</Button>
          <Button size="sm" onClick={() => { onApply(draft); setOpen(false); }}>Apply</Button>
        </div>
      </div>
    </Popover>
  );
}
