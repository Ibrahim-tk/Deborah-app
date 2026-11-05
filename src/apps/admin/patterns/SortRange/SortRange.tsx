/** @pattern SortRange — one dropdown for Latest, Oldest or a Custom range of dates (opens a small date dialog).
 *  Pair with `applySort` (sortRange.ts). `rangeLabel` names what the dates mean, e.g. "Signed up between". */
import { useState } from 'react';
import { formatDate } from '@shared/admin';
import { Button, DateField, Dialog, Select } from '@admin/ui';
import { TODAY } from '../DateRangeFilter/range';
import type { SortValue } from './sortValue';
import styles from './SortRange.module.css';

export function SortRange({ value, onChange, rangeLabel = 'Dates between' }: { value: SortValue; onChange: (v: SortValue) => void; rangeLabel?: string }) {
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState({ from: value.from, to: value.to });
  const invalid = !draft.from || !draft.to || draft.from > draft.to;

  return (
    <>
      <Select<SortValue['order']>
        label="Sort"
        hideLabel
        value={value.order}
        onChange={(o) => (o === 'custom' ? setPicking(true) : onChange({ ...value, order: o }))}
        options={[
          { value: 'latest', label: 'Latest' },
          { value: 'oldest', label: 'Oldest' },
          { value: 'custom', label: value.order === 'custom' ? `${formatDate(value.from)} to ${formatDate(value.to)}` : 'Custom range' },
        ]}
      />
      {picking && (
        <Dialog
          title={rangeLabel}
          onClose={() => setPicking(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setPicking(false)}>Cancel</Button>
              <Button disabled={invalid} onClick={() => { onChange({ order: 'custom', ...draft }); setPicking(false); }}>Apply dates</Button>
            </>
          }
        >
          <div className={styles.fields}>
            <DateField label="From" today={TODAY} max={draft.to || TODAY} value={draft.from} onChange={(from) => setDraft((d) => ({ ...d, from }))} />
            <DateField label="To" today={TODAY} min={draft.from} max={TODAY} value={draft.to} error={draft.from && draft.to && draft.from > draft.to ? 'Pick a date after the start date.' : undefined} onChange={(to) => setDraft((d) => ({ ...d, to }))} />
          </div>
        </Dialog>
      )}
    </>
  );
}

