/**
 * @ui DateField — a form field that opens a non-scrolling MUI-style calendar (CalendarGrid) in a floating
 * overlay anchored under the field (Base UI Popover, imported only here — CLAUDE.md rule 7) instead of the browser's native date picker (designer, 2026-10-30). Value is ISO `yyyy-mm-dd`.
 * @xref web: apps/web/ui/DateField (same dropdown overlay; designer 2026-10-31: no bottom sheet on mobile)
 */
import { useId, useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { formatShortDate } from '@shared/utils';
import { CalendarGrid } from '../CalendarGrid';
import { Icon } from '../Icon';
import { OVERLAY_HOST_ID } from '../Overlay';
import styles from './DateField.module.css';

/** Local yyyy-mm-dd (field primitives don't read the store's simulated clock). */
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };


export interface DateFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  minYear: number;
  maxYear: number;
  /** Year the calendar opens on when the field is empty. */
  defaultYear?: number;
  placeholder?: string;
  error?: string;
  /** Earliest selectable day (yyyy-mm-dd), e.g. today for an upcoming appointment. Overrides `minYear`. */
  min?: string;
  disabled?: boolean;
}

export function DateField({ label, value, onChange, minYear, maxYear, defaultYear, placeholder = 'Select a date', error, min, disabled }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const today = todayKey();
  // Never past today when the range ends this year (date of birth); appointments run into future years.
  const max = maxYear <= Number(today.slice(0, 4)) ? (today < `${maxYear}-12-31` ? today : `${maxYear}-12-31`) : `${maxYear}-12-31`;
  // MUI-style: a far-off default (date of birth) opens on the year page; near dates open on the month.
  const openTo = !value && Math.abs((defaultYear ?? maxYear) - Number(today.slice(0, 4))) > 1 ? 'year' : 'day';
  const pick = (iso: string) => { onChange(iso); setOpen(false); };
  const calendar = (
    <CalendarGrid value={value || undefined} today={today} min={min ?? `${minYear}-01-01`} max={max} openTo={openTo} initialFocus={`${defaultYear ?? maxYear}-06-15`} onChange={pick} />
  );
  return (
    <div className={styles.root}>
      <span id={id} className={styles.label}>{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={
            <button type="button" className={styles.field} data-invalid={error ? '' : undefined} aria-labelledby={id} disabled={disabled}>
              <span data-empty={!value || undefined}>{value ? formatShortDate(value) : placeholder}</span>
              <Icon name="calendar" size={20} className={styles.icon} />
            </button>
          }
        />
        <Popover.Portal container={document.getElementById(OVERLAY_HOST_ID)}>
          <Popover.Positioner side="bottom" align="start" sideOffset={8} className={styles.positioner}>
            <Popover.Popup className={styles.panel} aria-label={label}>{calendar}</Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {error && <span className={styles.error} role="alert">{error}</span>}
    </div>
  );
}
