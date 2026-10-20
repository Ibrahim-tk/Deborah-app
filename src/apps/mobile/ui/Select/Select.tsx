/**
 * @ui Select — field-styled trigger that opens a floating list (design 2026-10-20).
 * Adapter: built on MUI Base UI `Select` (unstyled; our CSS Modules + tokens). Base UI is imported only here
 * (CLAUDE.md rule 7). Portals into the phone's overlay host so it is never clipped by the screen.
 */
import { useId } from 'react';
import { Select as Base } from '@base-ui/react/select';
import { Icon } from '../Icon';
import { OVERLAY_HOST_ID } from '../Overlay';
import styles from './Select.module.css';

export interface SelectProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value?: T;
  placeholder?: string;
  onChange: (value: T) => void;
}

export function Select<T extends string>({ label, options, value, placeholder = 'Choose…', onChange }: SelectProps<T>) {
  const id = useId();
  const current = options.find((o) => o.value === value);
  return (
    <div className={styles.root}>
      <span id={id} className={styles.label}>{label}</span>
      <Base.Root value={value ?? null} onValueChange={(v) => v != null && onChange(v as T)} items={options}>
        <Base.Trigger className={styles.trigger} aria-labelledby={id}>
          <span className={current ? undefined : styles.placeholder}>{current?.label ?? placeholder}</span>
          <Base.Icon className={styles.icon}><Icon name="chevronDown" size={20} /></Base.Icon>
        </Base.Trigger>
        <Base.Portal container={document.getElementById(OVERLAY_HOST_ID)}>
          <Base.Positioner className={styles.positioner} sideOffset={6} alignItemWithTrigger={false}>
            <Base.Popup className={styles.popup}>
              <Base.List>
                {options.map((o) => (
                  <Base.Item key={o.value} value={o.value} className={styles.item}>
                    <Base.ItemText>{o.label}</Base.ItemText>
                    <Base.ItemIndicator className={styles.check}><Icon name="check" size={18} /></Base.ItemIndicator>
                  </Base.Item>
                ))}
              </Base.List>
            </Base.Popup>
          </Base.Positioner>
        </Base.Portal>
      </Base.Root>
    </div>
  );
}
