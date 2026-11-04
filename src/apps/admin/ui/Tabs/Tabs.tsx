/** @ui Tabs — Base UI Tabs: an underline tab list with a sliding indicator; one panel shown at a time.
 *  The list scrolls sideways on narrow screens. */
import type { ReactNode } from 'react';
import { Tabs as Base } from '@base-ui/react/tabs';
import styles from './Tabs.module.css';

export interface TabsProps<T extends string> {
  label: string;
  tabs: { value: T; label: string; content: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ label, tabs, value, onChange }: TabsProps<T>) {
  return (
    <Base.Root value={value} onValueChange={(v) => onChange(v as T)} className={styles.root}>
      <Base.List aria-label={label} className={styles.list}>
        {tabs.map((t) => (
          <Base.Tab key={t.value} value={t.value} className={styles.tab}>{t.label}</Base.Tab>
        ))}
        <Base.Indicator className={styles.indicator} />
      </Base.List>
      {tabs.map((t) => (
        <Base.Panel key={t.value} value={t.value} className={styles.panel}>{t.content}</Base.Panel>
      ))}
    </Base.Root>
  );
}
