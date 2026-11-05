/** @pattern DateRangeFilter — preset ranges in a Select; "Custom range" opens a dialog with from / to dates. */
import { useState } from 'react';
import { Button, DateField, Dialog, Select } from '@admin/ui';
import { formatDate } from '@shared/admin';
import { TODAY, presetRange, type DateRange } from './range';
import styles from './DateRangeFilter.module.css';

export function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const invalid = !draft.from || !draft.to || draft.from > draft.to;

  const pick = (p: DateRange['preset']) => {
    if (p === 'custom') {
      setDraft(value);
      setOpen(true);
    } else onChange(presetRange(p));
  };

  return (
    <>
      <Select
        label="Date range"
        hideLabel
        value={value.preset}
        onChange={pick}
        options={[
          // Weekly, monthly, quarterly and yearly views (story 2.1), plus a custom range.
          { value: '7', label: 'Last 7 days' },
          { value: '30', label: 'Last 30 days' },
          { value: '90', label: 'Last 90 days' },
          { value: '365', label: 'Last 12 months' },
          { value: 'custom', label: value.preset === 'custom' ? `${formatDate(value.from)} to ${formatDate(value.to)}` : 'Custom range' },
        ]}
      />
      {open && (
        <Dialog
          title="Choose dates"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={invalid} onClick={() => { onChange({ ...draft, preset: 'custom' }); setOpen(false); }}>Apply dates</Button>
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
