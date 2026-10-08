/**
 * @screen  M-2.1 · Conversation
 * @flow    F02 Core consultation (also hosts F03 safety states, F05 check-in, F06 profile chat)
 * @states  empty · focused · intake · ready · generating · answered · follow-up reply · error · stopped · gated · checkin · lab-informed answer
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361
 * @spec    docs/ux/F02-consultation.md#m-21-conversation
 * @xref    web: W-2.1 (apps/web/screens/consultation/Conversation) — not built
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { suggestionsData } from '@shared/data';
import { greeting, isMinor } from '@shared/engine';
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import type { Message } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { ActionSheet } from '@mobile/ui';
import { ChatHeader, Composer, Greeting, ScrollToLatest, SuggestionList, TrialCounter } from '@mobile/patterns/chat';
import { ProfileBanner, relationshipLabel } from '@mobile/patterns/profile';
import { useConversation } from '@mobile/hooks/useConversation';
import { useProfileSwitcher } from '@mobile/hooks/useProfileSwitcher';
import { useNav, useNavStore, useScreenParams } from '@mobile/navigation';
import { MessageList } from './parts/MessageList';
import { SafetyBench } from './parts/SafetyBench';
import { useAutoScroll } from './parts/useAutoScroll';
import { useReturnFlows } from './parts/useReturnFlows';
import { useMessageActions } from './parts/useMessageActions';
import styles from './Conversation.module.css';

export default function Conversation() {
  const chat = useConversation();
  const { conversation, profile, freeLeft, history, busy } = chat;
  const { open, push, pop, switchTab } = useNav();
  const setChromeHidden = useNavStore((s) => s.setChromeHidden);
  // Set by nav.openAsk(): M-7.4 "Ask Deborah about this" (prefill), M-7.1 "Start my first consultation" (focus).
  const { prefill, focus } = useScreenParams<{ prefill: string; focus: boolean }>();
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const actions = useMessageActions(profile?.id);
  const openSwitcher = useProfileSwitcher();
  const [recording, setRecording] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [underBar, setUnderBar] = useState(false);
  const safetyBench = useAppStore((s) => s.qa.safetyBench);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [draft, setDraft] = useState(prefill ?? '');
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState<Message | null>(null);

  const messages = conversation?.messages ?? [];
  const isEmpty = messages.length === 0;
  const generating = busy && conversation?.status === 'generating';
  // Emergency locks the composer until the user acknowledges it (docs/ux/F03-safety.md).
  const emergencyOpen = conversation?.status === 'safety' && messages.some((m) => m.kind === 'emergency' && !m.meta?.acknowledged);
  const last = messages.at(-1);
  const { ref: scrollRef, onScroll, showLatest, toBottom } = useAutoScroll(`${messages.length}:${last?.text?.length}:${JSON.stringify(last?.answer?.sections.map((s) => s.body.length + (s.bullets?.length ?? 0)))}:${conversation?.thinking}`);

  useEffect(() => () => setChromeHidden(false), [setChromeHidden]);
  useEffect(() => {
    if (focus || prefill) inputRef.current?.focus();
  }, [focus, prefill]);

  const chatSend = chat.send;
  const send = useCallback(
    async (text: string, scriptId?: string) => {
      const t = text.trim();
      if (!t) return;
      setDraft('');
      toBottom();
      // Gated by the free limit: the message stays in the composer (F04).
      const accepted = await chatSend(t, scriptId);
      if (!accepted) setDraft(t);
    },
    [chatSend, toBottom],
  );

  const { interceptFocus } = useReturnFlows({ startCheckIn: chat.startCheckIn, send, status: conversation?.status, busy, atBottom: !showLatest });

  const onFocusChange = (f: boolean) => {
    if (f && interceptFocus()) return inputRef.current?.blur();
    setFocused(f);
    if (f) return setChromeHidden(true);
    // Blur usually comes from pressing something else. Restoring the tab bar right away would
    // shift the layout under the pointer and swallow that click, so wait for the release
    // (a phone finishes the tap before the keyboard drops). Keyboard blur has no pointerup.
    const restore = () => {
      window.clearTimeout(fallback);
      window.removeEventListener('pointerup', onUp);
      setChromeHidden(false);
    };
    const onUp = () => window.setTimeout(restore, 0);
    const fallback = window.setTimeout(restore, 800);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const name = profile?.name ?? '';
  const now = nowFrom(clock);
  // F06: another profile's chat greets "Let's talk about {name}." and minors get the teen suggestion set.
  const other = Boolean(profile) && profile?.id !== SELF_PROFILE_ID;
  const minor = profile ? isMinor(profile, now) : false;
  const g = greeting(name, now, history[0]?.topic, other);
  const suggestions = minor ? suggestionsData.teen : suggestionsData.default;

  return (
    <div className={styles.root} data-xref="M-2.1 · Conversation">
      <ChatHeader onBack={pop} onNewChat={() => chat.startNew()} onInfo={() => setInfoOpen(true)} canStartNew={!isEmpty} scrolled={underBar} />
      {other && profile && (
        <ProfileBanner who={profile.relationship === 'other' ? name : relationshipLabel(profile.relationship)} minor={minor} onSwitch={openSwitcher} />
      )}

      <div
        ref={scrollRef}
        className={styles.scroll}
        onScroll={(e) => {
          onScroll();
          setUnderBar(e.currentTarget.scrollTop > 4);
        }}
      >
        <div className={styles.column}>
          {isEmpty ? (
            <Greeting line={g.line} question={g.question} welcomeBack={g.welcomeBack} onContinue={chat.continueLast} />
          ) : (
            conversation && (
              <MessageList
                conversation={conversation}
                busy={busy}
                chat={chat}
                actions={actions}
                onShop={(id) => open('M-2.7', { productId: id })}
                onBook={() => push('M-8.2')}
                onUploadLabs={() => open('M-5.3')}
                onRestartPlan={() => {
                  switchTab('health');
                  push('M-7.3');
                }}
                onLongPress={setPressed}
                onFocusComposer={() => inputRef.current?.focus()}
              />
            )
          )}
        </div>
      </div>

      <div className={styles.bottom}>
        {showLatest && !isEmpty && <ScrollToLatest onPress={() => toBottom(true)} />}
        {focused && isEmpty && !recording && <SuggestionList suggestions={suggestions} onSelect={(s) => send(s.text, s.scriptId)} />}
        {safetyBench && !emergencyOpen && <SafetyBench onInsert={(phrase) => { setDraft(phrase); inputRef.current?.focus(); }} />}
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={(text) => send(text ?? draft)}
          onStop={chat.stop}
          onAttach={() => open('M-5.3')}
          onFocusChange={onFocusChange}
          generating={generating}
          lockedNote={emergencyOpen ? 'Please get help first.' : undefined}
          inputRef={inputRef}
          placeholder={conversation?.status === 'intake' ? 'Or type your answer…' : 'Describe how you’re feeling…'}
          voiceSample={chat.voiceSample}
          onRecordingChange={setRecording}
          banner={freeLeft !== null && <TrialCounter inline left={freeLeft} onChoosePlan={() => open('M-4.1')} />}
        />
      </div>

      <ActionSheet
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        actions={[
          { label: 'About Deborah', onSelect: () => push('M-7.6') },
          { label: 'Book Deborah', onSelect: () => push('M-8.2') },
          { label: 'About this app & disclaimer', onSelect: () => open('M-10.5') },
        ]}
      />
      <ActionSheet
        open={Boolean(pressed)}
        onClose={() => setPressed(null)}
        actions={[
          { label: 'Copy', onSelect: () => pressed && actions.copyText(pressed.text ?? '') },
          { label: 'Save to Visit Notes', onSelect: () => pressed && actions.saveMessage(pressed) },
        ]}
      />
    </div>
  );
}
