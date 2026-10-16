/**
 * @deprecated Use FullChoicePills from `@flow-v1/apps/mobile/patterns/widgets`.
 * Thin adapter so older Health Basics imports keep working.
 */
import { FullChoicePills } from '@flow-v1/apps/mobile/patterns/widgets';

export interface ChoiceTilesProps {
  label: string;
  choices: { value: string; label: string }[];
  value: string;
  onPick: (value: string) => void;
}

export function ChoiceTiles({ label, choices, value, onPick }: ChoiceTilesProps) {
  return (
    <FullChoicePills
      label={label}
      options={choices.map((c) => ({ id: c.value, label: c.label }))}
      selected={value || undefined}
      onPick={onPick}
    />
  );
}
