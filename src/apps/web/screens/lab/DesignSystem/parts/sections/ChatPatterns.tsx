/** Chat patterns: conversation surface + Composer with every V2 product state. */
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  CareDisclaimer, ChatHeader, ChatLauncher, Composer, ConversationHeader, ErrorBubble, Greeting, MessageBubble,
  QuickReplies, ScrollToLatest, SuggestedQuestions, SuggestionList, ThinkingIndicator, TrialCounter,
  type ComposerAttachment,
} from '@web/patterns/chat';
import { scripts, FALLBACK_SCRIPT_ID, suggestionsData } from '@shared/data';
import { Group, Section } from '../Section';
import { Grid, Specimen, Variant } from '../Specimen';
import styles from './sections.module.css';

const noop = () => {};
const script = scripts[FALLBACK_SCRIPT_ID];

const PLACEHOLDER = 'Ask Deborah anything…';
const VOICE = script.voiceSample;

const composerBase = {
  onSend: noop as (text?: string) => void,
  onStop: noop,
  onAttach: noop as (source: 'camera' | 'upload') => void,
  onFocusChange: noop as (focused: boolean) => void,
  placeholder: PLACEHOLDER,
  voiceSample: VOICE,
};

/**
 * Design System mounts every section at once. Auto-demos must wait until the specimen is
 * visible in `[data-ds-scroll]` — otherwise focus()/menu clicks scroll to Chat and portal
 * Camera · Upload over Overview on reload.
 */
function useDemoWhenVisible(host: RefObject<HTMLElement | null>, run: () => void) {
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const root = el.closest('[data-ds-scroll]');
    let done = false;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || done) return;
        done = true;
        timer = window.setTimeout(() => runRef.current(), 80);
      },
      { root, threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [host]);
}

/** Auto-focus the field so the focused / peach-aura state is visible (only when scrolled into view). */
function FocusedComposer() {
  const host = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  useDemoWhenVisible(host, () => ref.current?.focus({ preventScroll: true }));
  return (
    <div ref={host}>
      <Composer
        {...composerBase}
        value=""
        onChange={noop}
        generating={false}
        onSymptoms={noop}
        inputRef={ref}
      />
    </div>
  );
}

/** Click Dictate when visible to show the recording chrome (silent ↔ talking cycles). */
function RecordingComposer() {
  const host = useRef<HTMLDivElement>(null);
  useDemoWhenVisible(host, () => {
    host.current?.querySelector<HTMLButtonElement>('button[aria-label="Dictate"]')?.click();
  });
  return (
    <div ref={host}>
      <Composer {...composerBase} value="" onChange={noop} generating={false} onSymptoms={noop} />
    </div>
  );
}

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
      {...composerBase}
      value={draft}
      onChange={setDraft}
      onSend={send}
      onStop={() => setGenerating(false)}
      generating={generating}
      onSymptoms={noop}
    />
  );
}

function TokensComposer() {
  const [tokens, setTokens] = useState(['Hot flashes', 'Night sweats']);
  return (
    <Composer
      {...composerBase}
      value=""
      onChange={noop}
      generating={false}
      onSymptoms={noop}
      tokens={tokens}
      onRemoveToken={(t) => setTokens((list) => list.filter((x) => x !== t))}
      symptomsActive
    />
  );
}

/** Opens the + attach menu (Camera · Upload) when this specimen scrolls into view — not on page load. */
function AttachMenuComposer() {
  const host = useRef<HTMLDivElement>(null);
  useDemoWhenVisible(host, () => {
    host.current?.querySelector<HTMLButtonElement>('button[aria-label="Add attachment"]')?.click();
  });
  return (
    <div ref={host}>
      <Composer {...composerBase} value="" onChange={noop} generating={false} onSymptoms={noop} />
    </div>
  );
}

function AttachmentsComposer() {
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([
    { id: 'img', name: 'lab-panel.jpg', image: '/images/deborah/portrait-placeholder.svg' },
    { id: 'doc', name: 'results.pdf' },
  ]);
  return (
    <Composer
      {...composerBase}
      value=""
      onChange={noop}
      generating={false}
      onSymptoms={noop}
      attachments={attachments}
      onRemoveAttachment={(id) => setAttachments((list) => list.filter((a) => a.id !== id))}
    />
  );
}

const COUNTER_NEAR = 'a'.repeat(1850);
const COUNTER_OVER = 'a'.repeat(2050);

function ComposerBlock({ children }: { children: ReactNode }) {
  return <div className={styles.composerStack}>{children}</div>;
}

export function ChatPatterns() {
  return (
    <Section id="chat" title="Chat" lede="Deborah unboxed; user in lilac. Composer is the solid writing surface — every product state below.">
      <Grid>
        <Specimen name="ConversationHeader · ChatHeader" path="patterns/chat/ConversationHeader" note="Glass controls float over the chat; titles stay quiet.">
          <Variant label="ConversationHeader">
            <div className={styles.headerStage}><ConversationHeader onMenu={noop} title="Ask Deborah" profile={{ name: 'Maria', guest: false, onPress: noop }} onNotifications={noop} /></div>
          </Variant>
          <Variant label="ChatHeader">
            <div className={styles.headerStage}><ChatHeader guest onSignIn={noop} onSignUp={noop} /></div>
          </Variant>
        </Specimen>

        <Specimen name="Greeting" path="patterns/chat/Greeting" note="Empty chat: Oracle orb and one question. No continue row.">
          <Greeting />
        </Specimen>

        <Specimen name="MessageBubble · ThinkingIndicator" path="patterns/chat/MessageBubble" note="Avatar at the start of each Deborah turn. Working: one ring + changing words.">
          <div className={styles.thread} data-placeholder>
            <MessageBubble role="user" text={script.voiceSample} />
            <MessageBubble role="deborah" turnStart text={script.openingMessage} />
            <ThinkingIndicator label="Looking through my Handbook" />
          </div>
        </Specimen>

        <Specimen name="QuickReplies · SuggestedQuestions" path="patterns/chat/QuickReplies" note="Option rows under a Deborah message; follow-ups as borderless rows.">
          <Variant label="QuickReplies">
            <QuickReplies label="Did it help?" options={[{ id: 'y', label: 'Yes' }, { id: 'p', label: 'Partly' }, { id: 'n', label: 'Not yet' }]} onSelect={noop} />
          </Variant>
          <Variant label="SuggestedQuestions">
            <SuggestedQuestions questions={script.suggestedQuestions.slice(0, 3)} onSelect={noop} />
          </Variant>
        </Specimen>

        <Specimen name="SuggestionList · ErrorBubble · ScrollToLatest" path="patterns/chat/SuggestionList">
          <Variant label="SuggestionList"><SuggestionList suggestions={suggestionsData.default} onSelect={noop} /></Variant>
          <Variant label="ErrorBubble · error"><ErrorBubble kind="error" onRetry={noop} /></Variant>
          <Variant label="ErrorBubble · stopped"><ErrorBubble kind="stopped" onRetry={noop} /></Variant>
          <Variant label="ScrollToLatest"><div className={styles.relative}><div className={styles.anchor}><ScrollToLatest onPress={noop} /></div></div></Variant>
        </Specimen>

        <Specimen name="ChatLauncher · TrialCounter · CareDisclaimer" path="patterns/chat/ChatLauncher" note="CareDisclaimer lives in the thread (product path), not as Composer’s disclaimer prop.">
          <Variant label="ChatLauncher · glow"><ChatLauncher glow onOpen={noop} /></Variant>
          <Variant label="TrialCounter"><TrialCounter left={3} onChoosePlan={noop} /></Variant>
          <Variant label="TrialCounter · 0"><TrialCounter left={0} onChoosePlan={noop} /></Variant>
          <Variant label="CareDisclaimer"><CareDisclaimer text="Not a substitute for medical care." onDismiss={noop} /></Variant>
        </Specimen>
      </Grid>

      <Group title="Composer" note="V2 Conversation / FirstConsult. Product opens symptoms via onSymptoms → SymptomPicker sheet. Tap + for Camera · Upload.">
        <Grid>
          <Specimen name="Composer · idle" path="patterns/chat/Composer" note="Empty draft, send muted, EdgeLight running.">
            <Composer {...composerBase} value="" onChange={noop} generating={false} onSymptoms={noop} />
          </Specimen>

          <Specimen name="Composer · focused" path="patterns/chat/Composer" note="Field focused — peach aura, EdgeLight gathers.">
            <FocusedComposer />
          </Specimen>

          <Specimen name="Composer · send ready" path="patterns/chat/Composer" note="Has content → accent send.">
            <Composer {...composerBase} value="I’ve been waking hot at night." onChange={noop} generating={false} onSymptoms={noop} />
          </Specimen>

          <Specimen name="Composer · generating" path="patterns/chat/Composer" note="Field disabled, mic hidden, send becomes Stop.">
            <Composer {...composerBase} value="" onChange={noop} generating onSymptoms={noop} />
          </Specimen>

          <Specimen name="Composer · locked" path="patterns/chat/Composer" note="Emergency lock — solid chrome, tools off.">
            <Composer {...composerBase} value="" onChange={noop} generating={false} lockedNote="Messaging is paused while you get help." />
          </Specimen>

          <Specimen name="Composer · recording" path="patterns/chat/Composer" note="Mic path: wave (silent ↔ talking), Cancel · Stop · Send. Starts when scrolled into view.">
            <RecordingComposer />
          </Specimen>

          <Specimen name="Composer · char counter" path="patterns/chat/Composer" note="Counter from 1,800 characters.">
            <ComposerBlock>
              <Variant label="near limit">
                <Composer {...composerBase} value={COUNTER_NEAR} onChange={noop} generating={false} onSymptoms={noop} />
              </Variant>
              <Variant label="over 2,000">
                <Composer {...composerBase} value={COUNTER_OVER} onChange={noop} generating={false} onSymptoms={noop} />
              </Variant>
            </ComposerBlock>
          </Specimen>

          <Specimen name="Composer · attachments" path="patterns/chat/Composer" note="Image thumb + file tile with remove.">
            <AttachmentsComposer />
          </Specimen>

          <Specimen name="Composer · symptoms control" path="patterns/chat/Composer" note="Product path: onSymptoms opens SymptomPicker sheet. Default vs active.">
            <ComposerBlock>
              <Variant label="default">
                <Composer {...composerBase} value="" onChange={noop} generating={false} onSymptoms={noop} />
              </Variant>
              <Variant label="symptomsActive">
                <Composer {...composerBase} value="" onChange={noop} generating={false} onSymptoms={noop} symptomsActive />
              </Variant>
            </ComposerBlock>
          </Specimen>

          <Specimen name="Composer · symptom tokens" path="patterns/chat/Composer" note="Accent pills + remove; Symptoms control stays active.">
            <TokensComposer />
          </Specimen>

          <Specimen name="Composer · attach menu" path="patterns/chat/Composer" note="Tap + → Camera · Upload. Opens when this specimen scrolls into view.">
            <AttachMenuComposer />
          </Specimen>

          <Specimen name="Composer · trial banner" path="patterns/chat/Composer" note="banner slot with TrialCounter (wired in Conversation; may be gated).">
            <ComposerBlock>
              <Variant label="left > 0">
                <Composer
                  {...composerBase}
                  value=""
                  onChange={noop}
                  generating={false}
                  onSymptoms={noop}
                  banner={<TrialCounter left={2} inline onChoosePlan={noop} />}
                />
              </Variant>
              <Variant label="left = 0">
                <Composer
                  {...composerBase}
                  value=""
                  onChange={noop}
                  generating={false}
                  onSymptoms={noop}
                  banner={<TrialCounter left={0} inline onChoosePlan={noop} />}
                />
              </Variant>
            </ComposerBlock>
          </Specimen>

          <Specimen name="Composer · live" path="patterns/chat/Composer" note="Type and send — cycles generating → idle.">
            <LiveComposer />
          </Specimen>
        </Grid>
      </Group>
    </Section>
  );
}
