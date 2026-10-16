/**
 * @deprecated Use FullChoicePills from `@mobile/patterns/widgets` — same full-width stacked look.
 * Kept as a thin adapter so older Health Basics imports keep working.
 */
import { FullChoicePills } from '@mobile/patterns/widgets';

export interface ChoiceTilesProps {
  label: string;
  choices: { value: string; label: string }[];
  value: string;
  onPick: (value: string) => void;
  /** Ignored — describe flows belong on QuestionChoices / StepBody. */
  describeValue?: string;
  describeLabel?: string;
  describePlaceholder?: string;
  describeText?: string;
  onDescribeChange?: (text: string) => void;
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
