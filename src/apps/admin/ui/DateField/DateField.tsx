/** @ui DateField — admin date field: looks like the other admin fields and opens the app's own MUI-style calendar
 *  (web ui/CalendarGrid, borrowed one way like CodeInput) in a floating overlay, instead of the browser's native
 *  date picker. Value is ISO `yyyy-mm-dd`. Portals into the admin overlay host so tokens apply. */
import { useId, useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { CalendarGrid } from '@web/ui';
import { Icon } from '../Icon';
import { overlayRef } from '../Overlay';
import f from '../field.module.css';
import styles from './DateField.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
/** "2026-11-02" → "2 Nov 2026". */
const show = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

export interface DateFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  /** Earliest / latest selectable day (yyyy-mm-dd). */
  min?: string;
  max?: string;
  /** The "today" ring on the calendar; defaults to the device date. */
  today?: string;
  placeholder?: string;
  error?: string;
  hideLabel?: boolean;
}

export function DateField({ label, value, onChange, min, max, today = todayKey(), placeholder = 'Select a date', error, hideLabel }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={f.root}>
      <span id={id} className={hideLabel ? f.srOnly : f.label}>{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={
            <button type="button" className={[f.box, styles.trigger].join(' ')} data-invalid={error ? '' : undefined} aria-labelledby={id}>
              <span className={value ? styles.value : styles.placeholder}>{value ? show(value) : placeholder}</span>
              <Icon name="calendar" size={18} className={f.adorn} />
            </button>
          }
        />
        <Popover.Portal container={overlayRef}>
          <Popover.Positioner side="bottom" align="start" sideOffset={8} collisionPadding={12} className={styles.positioner}>
            <Popover.Popup className={styles.panel} aria-label={label}>
              <CalendarGrid value={value || undefined} today={today} min={min} max={max} initialFocus={value || max || today} onChange={(iso) => { onChange(iso); setOpen(false); }} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className={f.error} role="alert">{error}</p>}
    </div>
  );
}
