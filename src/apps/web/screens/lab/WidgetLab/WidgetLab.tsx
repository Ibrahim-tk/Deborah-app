/**
 * @screen  LAB · Widget lab (route /wid) — not a product screen
 * @flow    — design tool (design direction 2026-10-14)
 * @states  scripted thread (every widget once, labelled) · typed question → Deborah answers with a widget
 * @spec    —
 * @xref    web: — not built
 *
 * A single chat view that shows every on-the-fly widget in a believable scenario, so they can be styled
 * side by side. Widgets come from `@web/patterns/widgets` — the same modules V2 Conversation uses —
 * so a visual change here is a change in chat (and the reverse). Type anything: a keyword router
 * (no AI, no network) picks the widget Deborah answers with.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageBubble, ThinkingIndicator, Composer } from '@web/patterns/chat';
import { DeborahBlob, OVERLAY_HOST_ID } from '@web/ui';
import { LabWidget } from './LabWidget';
import { SCENARIO, mid, routeQuestion, type LabMessage } from './scenarios';
import styles from './WidgetLab.module.css';

const TYPING_MS = 900;

export default function WidgetLab() {
  const [messages, setMessages] = useState<LabMessage[]>(SCENARIO);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const later = useCallback((next: LabMessage) => {
    setTyping(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, next]);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }));
    }, TYPING_MS);
  }, []);

  const reply = useCallback((userText: string | undefined, deborah: string) => {
    if (userText) setMessages((m) => [...m, { id: mid(), role: 'user', text: userText }]);
    later({ id: mid(), role: 'deborah', text: deborah });
  }, [later]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setDraft('');
    setMessages((m) => [...m, { id: mid(), role: 'user', text: t }]);
    later(routeQuestion(t));
  };

  return (
    <div className={styles.root} data-xref="LAB · Widget lab">
      <header className={styles.header}>
        <DeborahBlob size={36} label="The Oracle" />
        <div>
          <p className={styles.name}>Widget lab</p>
          <p className={styles.sub}>Every chat widget, in context. Ask anything below.</p>
        </div>
      </header>
      <div ref={scrollRef} className={styles.scroll}>
        <div className={styles.column} data-placeholder>
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <MessageBubble key={m.id} role="user" text={m.text} />
            ) : (
              <div key={m.id} className={styles.turn}>
                {m.tag && <p className={styles.tag}>{m.tag}</p>}
                <MessageBubble role="deborah" text={m.text} turnStart={messages[i - 1]?.role !== 'deborah'}>
                  {m.widget && <LabWidget kind={m.widget} reply={reply} />}
                </MessageBubble>
              </div>
            ),
          )}
          {typing && <ThinkingIndicator label="The Oracle is writing…" />}
          <div className={styles.composer}>
            <Composer
              value={draft}
              onChange={setDraft}
              onSend={(text) => send(text ?? draft)}
              onStop={() => {}}
              onAttach={() => later({ id: mid(), role: 'deborah', text: 'Add it here:', widget: 'upload' })}
              onFocusChange={() => {}}
              generating={typing}
              placeholder="Try “book a visit”, “my energy”, “labs”…"
              voiceSample="Why do I keep waking up at 3am?"
            />
          </div>
        </div>
      </div>
      {/* Host for bottom sheets (the escalation sheet), as the app's Navigator provides. */}
      <div id={OVERLAY_HOST_ID} className={styles.overlayHost} />
    </div>
  );
}
