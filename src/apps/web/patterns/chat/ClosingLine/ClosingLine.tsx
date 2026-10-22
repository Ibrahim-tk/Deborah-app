/**
 * @pattern ClosingLine — mandatory closing line after §7, in a Linen panel
 * @usedBy  M-2.1, M-9.2
 * @spec    docs/ux/F02-consultation.md#answer-sections
 * @xref    web: apps/web/patterns/chat/ClosingLine — not built
 */
import { Panel } from '@web/ui';
import styles from './ClosingLine.module.css';

export function ClosingLine({ text }: { text: string }) {
  // No text, no panel: an empty Linen panel read as a stray grey bar under §7.
  if (!text?.trim()) return null;
  return (
    <Panel tone="linen">
      <p className={styles.text}>{text}</p>
    </Panel>
  );
}
