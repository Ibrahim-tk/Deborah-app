/** @ui Segmented — Base UI ToggleGroup (single choice): one rounded track, the selected segment sits on surface. */
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import styles from './Segmented.module.css';

export interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(v) => v[0] && onChange(v[0] as T)}
      className={styles.root}
    >
      {options.map((o) => (
        <Toggle key={o.value} value={o.value} className={styles.item}>{o.label}</Toggle>
      ))}
    </ToggleGroup>
  );
}
