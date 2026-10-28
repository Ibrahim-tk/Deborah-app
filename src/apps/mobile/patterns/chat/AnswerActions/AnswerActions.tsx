/**
 * @pattern AnswerActions — one row: Copy · Read aloud icons (styled tooltips), then small
 *          Visit Notes (and Book on lab answers) at the end
 * @usedBy  M-2.1, M-9.2
 * @spec    docs/ux/F02-consultation.md#pattern-spec--answeractions · DESIGN.md › Messages › Message actions
 * @xref    web: apps/mobile/patterns/chat/AnswerActions — not built
 */
import { Icon, type IconName } from '@mobile/ui';
import styles from './AnswerActions.module.css';

export interface AnswerActionsProps {
  /** Kept for API compatibility; the PDF tool was removed (design 2026-10-26). */
  onSavePdf?: () => void;
  onVisitNotes: () => void;
  /** Kept for API compatibility; the Share tool was removed (design 2026-10-26). */
  onShare?: () => void;
  onCopy: () => void;
  onListen: () => void;
  /** Kept for API compatibility; feedback controls were removed. */
  onFeedback?: (helpful: boolean) => void;
  /** Lab-informed answers add "Book Deborah" (docs/ux/F05-followup-labs.md#m-54). */
  onBook?: () => void;
}

function Tool({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    // Own styled tooltip (data-tip) instead of the native title bubble.
    <button type="button" className={styles.tool} onClick={onPress} aria-label={label} data-tip={label}>
      <Icon name={icon} size={20} />
    </button>
  );
}

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <button type="button" className={styles.action} onClick={onPress}>
      <Icon name={icon} size={16} />
      <span>{label}</span>
    </button>
  );
}

/* One quiet row: icon tools (Copy · Read aloud) on the left, small labelled
   actions (Visit Notes, Consult with support team) on the right. Feedback thumbs removed (2026-10-08). */
export function AnswerActions({ onVisitNotes, onCopy, onListen, onBook }: AnswerActionsProps) {
  return (
    <div className={styles.root}>
      <div className={styles.tools} role="toolbar" aria-label="Answer tools">
        <Tool icon="copy" label="Copy" onPress={onCopy} />
        <Tool icon="listen" label="Read aloud" onPress={onListen} />
      </div>
      <div className={styles.actions}>
        {onBook && <Action icon="calendar" label="Book" onPress={onBook} />}
        <Action icon="note" label="Visit Notes" onPress={onVisitNotes} />
      </div>
    </div>
  );
}
