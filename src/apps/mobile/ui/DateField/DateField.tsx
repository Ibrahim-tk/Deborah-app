/**
 * @ui DateField — a form field that opens the app's own DateWheel in a bottom sheet instead of the browser's
 * native date picker (designer, 2026-10-29). Value is ISO `yyyy-mm-dd`; shows "June 15, 1991".
 * @xref web: apps/web/ui/DateField (inline panel, no modal on desktop)
 */
import { useId, useState } from 'react';
import { formatShortDate } from '@shared/utils';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
import { DateWheel } from '../DateWheel';
import { Icon } from '../Icon';
import styles from './DateField.module.css';

export interface DateFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  minYear: number;
  maxYear: number;
  /** Year the wheel opens on when the field is empty. */
  defaultYear?: number;
  placeholder?: string;
  error?: string;
}

export function DateField({ label, value, onChange, minYear, maxYear, defaultYear, placeholder = 'Select a date', error }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const start = value || `${defaultYear ?? maxYear}-01-01`;
  return (
    <div className={styles.root}>
      <span id={id} className={styles.label}>{label}</span>
      <button type="button" className={styles.field} data-invalid={error ? '' : undefined} aria-labelledby={id} onClick={() => { if (!value) onChange(start); setOpen(true); }}>
        <span data-empty={!value || undefined}>{value ? formatShortDate(value) : placeholder}</span>
        <Icon name="calendar" size={20} className={styles.icon} />
      </button>
      {error && <span className={styles.error} role="alert">{error}</span>}
      <BottomSheet open={open} onClose={() => setOpen(false)} showClose title={label} footer={<Button fullWidth onClick={() => setOpen(false)}>Done</Button>}>
        <DateWheel label={label} value={value || start} minYear={minYear} maxYear={maxYear} onChange={onChange} />
      </BottomSheet>
    </div>
  );
}
