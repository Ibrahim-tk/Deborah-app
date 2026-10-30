/**
 * @pattern QuickReplies — option rows under a Oracle message (check-in Yes / Partly / Not yet,
 *          lab request "Upload my labs" + Not yet). Gone once answered: the user's bubble says it.
 * @usedBy  M-2.1 (check-in state)
 * @spec    docs/ux/F05-followup-labs.md#m-21-state--check-in-figma-52 · DESIGN.md › Option rows
 * @xref    web: apps/web/patterns/chat/QuickReplies — not built
 */
import type { Option } from '@shared/types/domain';
import type { IconName } from '@mobile/ui';
import { QuestionChoices } from '@mobile/patterns/widgets';
import { Button } from '@mobile/ui';
import styles from './QuickReplies.module.css';

export interface QuickRepliesProps {
  options: Option[];
  onSelect: (optionId: string) => void;
  /** A primary action above the rows (e.g. "Upload my labs"). */
  primary?: { label: string; icon?: IconName; onPress: () => void };
  label?: string;
  /** Show the rows locked with this option picked (login seed keeps answered widgets, design 2026-10-20). */
  answered?: string;
}

export function QuickReplies({ options, onSelect, primary, label = 'Reply', answered }: QuickRepliesProps) {
  return (
    <div className={styles.root}>
      {primary && !answered && primary.icon !== 'upload' && <Button fullWidth leadingIcon={primary.icon} onClick={primary.onPress}>{primary.label}</Button>}
      <QuestionChoices label={label} options={options} answered={answered ? [answered] : undefined} onSubmit={(ids) => onSelect(ids[0])} />
    </div>
  );
}
