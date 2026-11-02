/** @ui Select — Base UI Select: field-styled trigger, floating list portalled into the admin overlay host. */
import { useId } from 'react';
import { Select as Base } from '@base-ui/react/select';
import { Icon } from '../Icon';
import { overlayRef } from '../Overlay';
import f from '../field.module.css';
import styles from './Select.module.css';

export interface SelectProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value?: T;
  placeholder?: string;
  hideLabel?: boolean;
  onChange: (value: T) => void;
}

export function Select<T extends string>({ label, options, value, placeholder = 'Choose', hideLabel, onChange }: SelectProps<T>) {
  const id = useId();
  const current = options.find((o) => o.value === value);
  return (
    <div className={f.root}>
      <span id={id} className={hideLabel ? f.srOnly : f.label}>{label}</span>
      <Base.Root value={value ?? null} onValueChange={(v) => v != null && onChange(v as T)} items={options}>
        <Base.Trigger className={[f.box, styles.trigger].join(' ')} aria-labelledby={id}>
          <span className={current ? styles.value : styles.placeholder}>{current?.label ?? placeholder}</span>
          <Base.Icon className={f.adorn}><Icon name="chevronDown" size={18} /></Base.Icon>
        </Base.Trigger>
        <Base.Portal container={overlayRef}>
          <Base.Positioner className={styles.positioner} sideOffset={6} alignItemWithTrigger={false}>
            <Base.Popup className={styles.popup}>
              <Base.List>
                {options.map((o) => (
                  <Base.Item key={o.value} value={o.value} className={styles.item}>
                    <Base.ItemText>{o.label}</Base.ItemText>
                    <Base.ItemIndicator className={styles.check}><Icon name="check" size={16} /></Base.ItemIndicator>
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
