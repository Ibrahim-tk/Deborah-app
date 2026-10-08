/** @ui Select — field-styled trigger that opens an inline picker list of option rows. */
import { useId, useState } from 'react';
import { Icon } from '../Icon';
import { OptionList } from '../OptionList';
import { OptionRow } from '../OptionRow';
import styles from './Select.module.css';

export interface SelectProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value?: T;
  placeholder?: string;
  onChange: (value: T) => void;
}

export function Select<T extends string>({ label, options, value, placeholder = 'Choose…', onChange }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const current = options.find((o) => o.value === value);
  return (
    <div className={styles.root}>
      <span id={id} className={styles.label}>{label}</span>
      <button type="button" aria-labelledby={id} aria-expanded={open} className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <span className={current ? undefined : styles.placeholder}>{current?.label ?? placeholder}</span>
        <Icon name="chevronDown" size={20} />
      </button>
      {open && (
        <OptionList label={label}>
          {options.map((o) => (
            <OptionRow key={o.value} selected={o.value === value} onSelect={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
            </OptionRow>
          ))}
        </OptionList>
      )}
    </div>
  );
}
