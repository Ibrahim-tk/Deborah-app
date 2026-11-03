/** The exchange around an escalation, drawn with the web app's own chat bubble (web patterns/chat/MessageBubble):
 *  the client's messages are the right-aligned purple bubbles, the Oracle's replies are plain text, exactly as
 *  the client saw them. The message that raised the flag carries a small label above it. */
import type { Escalation } from '@shared/admin';
import { MessageBubble } from '@web/patterns/chat/MessageBubble';
import styles from './Conversation.module.css';

export function Conversation({ esc }: { esc: Escalation }) {
  return (
    <div className={styles.thread}>
      {esc.messages.map((m, i) => (
        <div key={i} className={styles.turn} data-from={m.from}>
          {m.trigger && <span className={styles.flag}>Raised the flag</span>}
          <MessageBubble role={m.from === 'client' ? 'user' : 'deborah'} text={m.text} turnStart={m.from === 'oracle'} />
        </div>
      ))}
    </div>
  );
}
