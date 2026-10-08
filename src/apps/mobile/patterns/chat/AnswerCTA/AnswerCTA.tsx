/**
 * @pattern AnswerCTA — "Tell me what you think": secondary from intake Q1, primary when ready
 * @usedBy  M-2.1
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › intake, ready)
 * @xref    web: apps/web/patterns/chat/AnswerCTA — not built
 */
import { Button } from '@mobile/ui';

export interface AnswerCTAProps {
  label: string;
  emphasis: 'primary' | 'secondary';
  disabled?: boolean;
  onPress: () => void;
}

export function AnswerCTA({ label, emphasis, disabled, onPress }: AnswerCTAProps) {
  return (
    <Button variant={emphasis} fullWidth disabled={disabled} onClick={onPress}>
      {label}
    </Button>
  );
}
