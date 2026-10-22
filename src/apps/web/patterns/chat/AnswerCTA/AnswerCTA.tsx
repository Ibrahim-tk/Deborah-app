/**
 * @pattern AnswerCTA — "Tell me what you think": secondary from intake Q1, primary when ready
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › intake, ready)
 * @xref    web: apps/web/patterns/chat/AnswerCTA — not built
 */
import { Button, Icon } from '@web/ui';
import styles from './AnswerCTA.module.css';

export interface AnswerCTAProps {
  label: string;
  emphasis: 'primary' | 'secondary';
  disabled?: boolean;
  onPress: () => void;
}

export function AnswerCTA({ label, emphasis, disabled, onPress }: AnswerCTAProps) {
  if (emphasis === 'primary') {
    return (
      <Button variant="primary" fullWidth disabled={disabled} onClick={onPress}>
        {label}
      </Button>
    );
  }
  // Secondary: a quiet glass action row that sits in the same family as the intake options and composer.
  return (
    <button type="button" className={styles.quiet} disabled={disabled} onClick={onPress}>
      <span className={styles.label}>{label}</span>
      <span className={styles.arrow} aria-hidden="true">
        <Icon name="chevron" size={18} />
      </span>
    </button>
  );
}
