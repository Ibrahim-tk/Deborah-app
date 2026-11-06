/** "More filters": the less-used categories in a dialog. Changes apply on Apply; closing discards them. */
import { useState } from 'react';
import { Button, Dialog, Select } from '@admin/ui';
import type { FilterCategory } from '../types';
import styles from '../TableFilters.module.css';

interface MoreFiltersProps {
  categories: FilterCategory[];
  values: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
}

export function MoreFilters({ categories, values, onApply }: MoreFiltersProps) {
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const active = categories.filter((c) => (values[c.key] ?? 'all') !== 'all').length;
  const clearDraft = () => setDraft(Object.fromEntries(categories.map((c) => [c.key, 'all'])));

  return (
    <>
      <Button variant="secondary" leadingIcon="menu" onClick={() => setDraft(Object.fromEntries(categories.map((c) => [c.key, values[c.key] ?? 'all'])))}>
        {active ? `More filters (${active})` : 'More filters'}
      </Button>
      {draft && (
        <Dialog
          title="More filters"
          onClose={() => setDraft(null)}
          footer={
            <>
              <Button variant="ghost" onClick={clearDraft}>Clear all</Button>
              <Button onClick={() => { onApply(draft); setDraft(null); }}>Apply</Button>
            </>
          }
        >
          <div className={styles.panel}>
            {categories.map((c) => (
              <Select key={c.key} label={c.label} value={draft[c.key]} onChange={(v) => setDraft({ ...draft, [c.key]: v })} options={c.options} />
            ))}
            <p className={styles.panelNote}>Nothing changes until you select Apply.</p>
          </div>
        </Dialog>
      )}
    </>
  );
}
