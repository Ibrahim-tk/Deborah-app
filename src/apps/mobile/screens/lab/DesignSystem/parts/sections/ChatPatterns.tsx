/** Chat patterns: the essentials only — messages, quick replies and one live Composer. */
import { useState } from 'react';
import { Composer, MessageBubble, QuickReplies, ThinkingIndicator } from '@mobile/patterns/chat';
import { scripts, FALLBACK_SCRIPT_ID } from '@shared/data';
import { Section } from '../Section';
import { Grid, Specimen } from '../Specimen';
import styles from './sections.module.css';

const noop = () => {};
const script = scripts[FALLBACK_SCRIPT_ID];

/** Type and send — cycles generating → idle. */
function LiveComposer() {
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const send = () => {
    setDraft('');
    setGenerating(true);
    window.setTimeout(() => setGenerating(false), 2400);
  };
  return (
    <Composer
      value={draft}
      onChange={setDraft}
      onSend={send}
      onStop={() => setGenerating(false)}
      onFocusChange={noop}
      generating={generating}
      onSymptoms={noop}
      placeholder="Ask Oracle anything…"
      voiceSample={script.voiceSample}
    />
  );
}

export function ChatPatterns() {
  return (
    <Section id="chat" title="Chat" lede="The Oracle speaks unboxed; your words sit in lilac bubbles.">
      <Grid>
        <Specimen name="Messages" path="patterns/chat/MessageBubble">
          <div className={styles.thread} data-placeholder>
            <MessageBubble role="user" text={script.voiceSample} />
            <MessageBubble role="deborah" turnStart text={script.openingMessage} />
            <ThinkingIndicator label="Looking through my Handbook" />
          </div>
        </Specimen>
        <Specimen name="Quick replies" path="patterns/chat/QuickReplies">
          <QuickReplies label="Did it help?" options={[{ id: 'y', label: 'Yes' }, { id: 'p', label: 'Partly' }, { id: 'n', label: 'Not yet' }]} onSelect={noop} />
        </Specimen>
      </Grid>
      <Specimen name="Composer" path="patterns/chat/Composer">
        <LiveComposer />
      </Specimen>
    </Section>
  );
}
