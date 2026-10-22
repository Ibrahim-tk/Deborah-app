/** Text size steps (DESIGN.md › Text size control). */
import type { AppState } from '@shared/store';

type TextSize = AppState['settings']['textSize'];

export const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 0.9, label: 'Smaller' },
  { value: 1, label: 'Default' },
  { value: 1.15, label: 'Larger' },
  { value: 1.3, label: 'Largest' },
];

export const textSizeLabel = (size: TextSize) => TEXT_SIZES.find((s) => s.value === size)?.label ?? 'Default';
