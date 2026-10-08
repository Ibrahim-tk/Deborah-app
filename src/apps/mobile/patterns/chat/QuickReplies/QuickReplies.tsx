/**
 * @pattern QuickReplies — option rows under a Deborah message (check-in Yes / Partly / Not yet,
 *          lab request "Upload my labs" + Not yet). Gone once answered: the user's bubble says it.
 * @usedBy  M-2.1 (check-in state)
 * @spec    docs/ux/F05-followup-labs.md#m-21-state--check-in-figma-52 · DESIGN.md › Option rows
 * @xref    web: apps/web/patterns/chat/QuickReplies — not built
 */
import type { Option } from '@shared/types/domain';
import { Button, OptionList, OptionRow, type IconName } from '@mobile/ui';
import styles from './QuickReplies.module.css';

export interface QuickRepliesProps {
  options: Option[];
  onSelect: (optionId: string) => void;
  /** A primary action above the rows (e.g. "Upload my labs"). */
  primary?: { label: string; icon?: IconName; onPress: () => void };
  label?: string;
}

export function QuickReplies({ options, onSelect, primary, label = 'Reply' }: QuickRepliesProps) {
  return (
    <div className={styles.root}>
      {primary && (
        <Button fullWidth leadingIcon={primary.icon} onClick={primary.onPress}>
          {primary.label}
        </Button>
      )}
      <OptionList label={label}>
        {options.map((o) => (
          <OptionRow key={o.id} onSelect={() => onSelect(o.id)}>
            {o.label}
          </OptionRow>
        ))}
      </OptionList>
    </div>
  );
}
