/** @shell MenuParts — section headings, items and option rows shared by TopNav popovers. */
import type { ReactNode } from 'react';
import styles from './MenuParts.module.css';

export function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </section>
  );
}

export interface MenuItemProps {
  label: string;
  description?: string;
  active?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export function MenuItem({ label, description, active, disabled, onSelect }: MenuItemProps) {
  return (
    <button
      type="button"
      className={styles.item}
      data-active={active || undefined}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className={styles.label}>{label}</span>
      {description && <span className={styles.description}>{description}</span>}
    </button>
  );
}

export function MenuCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export interface MenuChoiceProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function MenuChoice<T extends string>({ label, value, options, onChange }: MenuChoiceProps<T>) {
  return (
    <div className={styles.choice} role="radiogroup" aria-label={label}>
      <span className={styles.choiceLabel}>{label}</span>
      <span className={styles.segments}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className={styles.segment}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </span>
    </div>
  );
}
