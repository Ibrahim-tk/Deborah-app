/**
 * @pattern Greeting — Deborah orb centred with one question (self: "How are you feeling today?";
 *          family/advocate: "Tell me how’s {name} feeling today?").
 *          No continue-conversation row, suggestions or disclaimer (empty chat only).
 * @usedBy  M-2.1 (empty state)
 * @spec    docs/ux/F02-consultation.md#m-21-conversation (States › empty)
 * @xref    web: apps/web/patterns/chat/Greeting — not built
 */
import { DeborahBlob } from '@web/ui';
import styles from './Greeting.module.css';

export interface GreetingProps {
  /** The orb's question; defaults to the owner's. Family/advocate chats pass a personalised line. */
  line?: string;
}

export function Greeting({ line = 'How are you feeling today?' }: GreetingProps) {
  return (
    <div className={styles.root} data-placeholder>
      <DeborahBlob size={140} label="Oracle" />
      <h2 className={styles.line}>{line}</h2>
    </div>
  );
}
