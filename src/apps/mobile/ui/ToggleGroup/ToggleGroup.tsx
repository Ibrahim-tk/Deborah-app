/**
 * @ui ToggleGroup — MUI ToggleButtonGroup-style segmented control (designer, 2026-10-28): one bordered, fully rounded
 *     group, pill-shaped options inside, the picked one tinted. Single choice; tapping the picked one keeps it.
 * Adapter: MUI Base UI `ToggleGroup` + `Toggle` (unstyled; our tokens). Base UI is imported only here (CLAUDE.md rule 7).
 */
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import styles from './ToggleGroup.module.css';

export interface ToggleGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function ToggleGroup<T extends string>({ options, value, onChange, label }: ToggleGroupProps<T>) {
  return (
    <BaseToggleGroup
      className={styles.root}
      aria-label={label}
      value={[value]}
      onValueChange={(next) => {
        const picked = next[0] as T | undefined;
        if (picked && picked !== value) onChange(picked);
      }}
    >
      {options.map((o) => (
        <Toggle key={o.value} value={o.value} className={styles.item}>
          {o.label}
        </Toggle>
      ))}
    </BaseToggleGroup>
  );
}
