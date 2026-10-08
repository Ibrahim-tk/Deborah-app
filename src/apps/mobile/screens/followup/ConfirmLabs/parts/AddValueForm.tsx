/** "+ Add a value": marker with suggestions (TSH, Free T3, …), value on a decimal keypad, unit. */
import { useState } from 'react';
import { labMarkerList } from '@shared/data';
import { Button, Input, OptionList, OptionRow } from '@mobile/ui';
import styles from '../ConfirmLabs.module.css';
import own from './AddValueForm.module.css';

export interface AddValueFormProps {
  /** Markers already in the list (not suggested again). */
  existing: string[];
  onAdd: (v: { marker: string; value: string; unit: string }) => void;
  onClose: () => void;
}

export function AddValueForm({ existing, onAdd, onClose }: AddValueFormProps) {
  const [marker, setMarker] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState<string>();
  const q = marker.trim().toLowerCase();
  const exact = labMarkerList.some((m) => m.marker.toLowerCase() === q);
  const suggestions = exact
    ? []
    : labMarkerList.filter((m) => !existing.includes(m.marker) && (!q || m.marker.toLowerCase().includes(q))).slice(0, 4);

  const add = () => {
    if (!marker.trim()) return setError('Choose or type a marker, e.g. TSH.');
    if (!value.trim()) return setError('Enter the value from your report.');
    onAdd({ marker: marker.trim(), value: value.trim(), unit: unit.trim() });
    setMarker('');
    setValue('');
    setUnit('');
    setError(undefined);
  };

  return (
    <div className={own.root}>
      <Input label="Marker" placeholder="e.g. TSH" value={marker} onChange={(e) => setMarker(e.target.value)} />
      {suggestions.length > 0 && (
        <OptionList layout="grid2" label="Suggested markers">
          {suggestions.map((m) => (
            <OptionRow
              key={m.marker}
              onSelect={() => {
                setMarker(m.marker);
                setUnit(m.unit);
              }}
            >
              {m.marker}
            </OptionRow>
          ))}
        </OptionList>
      )}
      <div className={own.fields}>
        <Input label="Value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
        <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={own.actions}>
        <Button variant="ghost" size="sm" onClick={onClose}>Done adding</Button>
        <Button variant="secondary" size="md" leadingIcon="plus" onClick={add}>Add</Button>
      </div>
    </div>
  );
}
