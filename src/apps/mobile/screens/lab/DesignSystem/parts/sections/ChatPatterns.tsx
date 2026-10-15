/** Chat patterns, part 1: the conversation surface — header, greeting, messages, composer and its helpers. */
import { useState } from 'react';
import {
  CareDisclaimer, ChatHeader, ChatLauncher, Composer, ConversationHeader, ErrorBubble, Greeting, MessageBubble,
  QuickReplies, ScrollToLatest, SuggestedQuestions, SuggestionList, ThinkingIndicator, TrialCounter,
} from '@mobile/patterns/chat';
import { scripts, FALLBACK_SCRIPT_ID, suggestionsData } from '@shared/data';
import { Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

const noop = () => {};
const script = scripts[FALLBACK_SCRIPT_ID];

export function ChatPatterns() {
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const send = () => {
    setDraft('');
    setGenerating(true);
    window.setTimeout(() => setGenerating(false), 2400);
  };
  return (
    <Section id="chat" title="Chat" lede="Deborah’s words unboxed and full-width; the user’s in lilac bubbles. The composer is the one solid, softly lifted writing surface.">
      <Grid>
        <Specimen name="ConversationHeader · ChatHeader" path="patterns/chat/ConversationHeader" note="Glass controls float over the chat; titles stay quiet.">
          <Variant label="ConversationHeader">
            <div className={styles.headerStage}><ConversationHeader onMenu={noop} title="Ask Deborah" profile={{ name: 'Maria', guest: false, onPress: noop }} onNotifications={noop} /></div>
          </Variant>
          <Variant label="ChatHeader">
            <div className={styles.headerStage}><ChatHeader onBack={noop} onNewChat={noop} canStartNew /></div>
          </Variant>
        </Specimen>

        <Specimen name="Greeting" path="patterns/chat/Greeting" note="Empty chat: Deborah’s orb and one question. Returning users can pick up where they left off.">
          <Greeting welcomeBack="Your sleep" onContinue={noop} />
        </Specimen>

        <Specimen name="MessageBubble · ThinkingIndicator" path="patterns/chat/MessageBubble" note="Avatar and name at the start of each Deborah turn only. Working state: one ring + changing words." >
          <div className={styles.thread} data-placeholder>
            <MessageBubble role="user" text={script.voiceSample} />
            <MessageBubble role="deborah" turnStart text={script.openingMessage} />
            <ThinkingIndicator label="Looking through my Handbook" />
          </div>
        </Specimen>

        <Specimen name="QuickReplies · SuggestedQuestions" path="patterns/chat/QuickReplies" note="Answers as option rows under a Deborah message; follow-ups as borderless rows with an AI-search icon.">
          <Variant label="QuickReplies">
            <QuickReplies label="Did it help?" options={[{ id: 'y', label: 'Yes' }, { id: 'p', label: 'Partly' }, { id: 'n', label: 'Not yet' }]} onSelect={noop} />
          </Variant>
          <Variant label="SuggestedQuestions">
            <SuggestedQuestions questions={script.suggestedQuestions.slice(0, 3)} onSelect={noop} />
          </Variant>
        </Specimen>

        <Specimen name="SuggestionList · ErrorBubble · ScrollToLatest" path="patterns/chat/SuggestionList" note="Starter prompts scroll horizontally. Errors speak in Deborah’s voice with a Retry.">
          <Variant label="SuggestionList"><SuggestionList suggestions={suggestionsData.default} onSelect={noop} /></Variant>
          <Variant label="ErrorBubble · error"><ErrorBubble kind="error" onRetry={noop} /></Variant>
          <Variant label="ErrorBubble · stopped"><ErrorBubble kind="stopped" onRetry={noop} /></Variant>
          <Variant label="ScrollToLatest"><div className={styles.relative}><div className={styles.anchor}><ScrollToLatest onPress={noop} /></div></div></Variant>
        </Specimen>

        <Specimen name="Composer" path="patterns/chat/Composer" note="Grows 1–5 lines. Attach, Symptoms, mic, send; send becomes Stop while Deborah writes. Try sending.">
          <Variant label="live">
            <Composer
              value={draft} onChange={setDraft} onSend={send} onStop={() => setGenerating(false)} onAttach={noop} onFocusChange={noop}
              generating={generating} placeholder="Ask Deborah anything…" voiceSample={script.voiceSample} onSymptoms={noop}
              banner={<TrialCounter left={2} inline onChoosePlan={noop} />} disclaimer="Educational only. Not a substitute for medical care."
            />
          </Variant>
          <Variant label="locked (emergency)">
            <Composer value="" onChange={noop} onSend={noop} onStop={noop} onAttach={noop} onFocusChange={noop} generating={false}
              placeholder="" voiceSample="" lockedNote="Messaging is paused while you get help." />
          </Variant>
        </Specimen>

        <Specimen name="ChatLauncher · TrialCounter · CareDisclaimer" path="patterns/chat/ChatLauncher" note="Launcher looks like the composer but is one button (Home hero adds the travelling edge light).">
          <Variant label="ChatLauncher · glow"><ChatLauncher glow onOpen={noop} /></Variant>
          <Variant label="TrialCounter"><TrialCounter left={3} onChoosePlan={noop} /></Variant>
          <Variant label="TrialCounter · 0"><TrialCounter left={0} onChoosePlan={noop} /></Variant>
          <Variant label="CareDisclaimer"><CareDisclaimer text="Not a substitute for medical care." onDismiss={noop} actionLabel="Got it" /></Variant>
        </Specimen>
      </Grid>
    </Section>
  );
}
