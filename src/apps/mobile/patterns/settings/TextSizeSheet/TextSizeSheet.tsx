/**
 * @pattern TextSizeSheet — in-app text size: Smaller 0.9 · Default 1.0 · Larger 1.15 · Largest 1.3
 *          (DESIGN.md › Typography › Text size control). Multiplies --type-scale for the whole app.
 * @usedBy  M-10.1 (Text size row), M-2.1 ((i) menu › Text size)
 * @spec    DESIGN.md#text-size-control
 * @xref    web: — (desktop uses browser zoom)
 */
import { useAppStore } from '@shared/store';
import { ActionSheet } from '@mobile/ui';
import { TEXT_SIZES } from './textSizes';

export interface TextSizeSheetProps {
  open: boolean;
  onClose: () => void;
}

export function TextSizeSheet({ open, onClose }: TextSizeSheetProps) {
  const current = useAppStore((s) => s.settings.textSize);
  const setTextSize = useAppStore((s) => s.setTextSize);
  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      title="Text size"
      actions={TEXT_SIZES.map((s) => ({
        // The current size is marked in words, not colour alone.
        label: s.value === current ? `${s.label} (current)` : s.label,
        onSelect: () => setTextSize(s.value),
      }))}
    />
  );
}
