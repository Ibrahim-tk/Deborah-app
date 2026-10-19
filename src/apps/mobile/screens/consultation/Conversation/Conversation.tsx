/**
 * @screen  M-2.1 · Conversation
 * @flow    F02 Core consultation (also hosts F03 safety states, F05 check-in, F06 profile chat)
 * @states  intake V2 (consent · connecting · about · reading · confirm · hand-off) · empty · focused · intake · ready · generating · answered · follow-up reply · error · stopped · gated · checkin · lab-informed answer
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361
 * @spec    docs/ux/F02-consultation.md#m-21-conversation
 * @xref    web: W-2.1 (apps/web/screens/consultation/Conversation) — not built
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { suggestionsData } from '@shared/data';
import { asksForAnswer, greeting, isMinor, pendingFacts } from '@shared/engine';
import { SELF_PROFILE_ID, useAppStore } from '@shared/store';
import type { Message } from '@shared/types/domain';
import { nowFrom } from '@shared/utils';
import { ActionSheet } from '@mobile/ui';
import { Aura, GradientShift } from '@mobile/ui';
import { ChatHeader, Composer, Greeting, ScrollToLatest, SuggestionList, SymptomPicker, TrialCounter, withSymptoms } from '@mobile/patterns/chat';
import { useConversation } from '@mobile/hooks/useConversation';
import { useProfileSwitcher } from '@mobile/hooks/useProfileSwitcher';
import { useNav, useNavStore, useScreenParams } from '@mobile/navigation';
import { MessageList } from './parts/MessageList';
import { ABOUT_PLACEHOLDER, ABOUT_VOICE_SAMPLE, IntakeFlow, useIntakeFlow } from './parts/IntakeFlow';
import { SafetyBench } from './parts/SafetyBench';
import { useAutoScroll } from './parts/useAutoScroll';
import { thirdPerson } from './parts/thirdPerson';
import { useReturnFlows } from './parts/useReturnFlows';
import { useDocumentHandoff } from './parts/useDocumentHandoff';
import { useMessageActions } from './parts/useMessageActions';
import { useHealthConsent } from './parts/useHealthConsent';
import styles from './Conversation.module.css';
import { useAccountGate } from '@mobile/hooks/useAccountGate';
import { useToast } from '@mobile/hooks/toast.store';

const SHOW_TRIAL_COUNTER = false;

export default function Conversation() {
  const chat = useConversation();
  const { conversation, profile, freeLeft, busy, history } = chat;
  const { open, push, pop, switchTab, presentSheet } = useNav();
  const gate = useAccountGate();
  const toast = useToast();
  const intake = useIntakeFlow();
  const setChromeHidden = useNavStore((s) => s.setChromeHidden);
  // Set by nav.openAsk(): M-7.4 "Ask Deborah about this" (prefill), M-7.1 "Start my first consultation" (focus).
  const { prefill, focus, startIntake } = useScreenParams<{ prefill: string; focus: boolean; startIntake: boolean }>();
  const clock = useAppStore(useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })));
  const openSwitcher = useProfileSwitcher();
  const [recording, setRecording] = useState(false);
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const [underBar, setUnderBar] = useState(false);
  /** F02d: while expand/gate pills are active, hide the bottom composer until Other. */
  const [intakeSurface, setIntakeSurface] = useState<'choices' | 'composer'>('composer');
  const safetyBench = useAppStore((s) => s.qa.safetyBench);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Miro Step 5 “No” branch: back to Ask Deborah with the composer ready.
  const actions = useMessageActions(profile?.id, () => inputRef.current?.focus());

  const [draft, setDraft] = useState(prefill ?? '');
  const [pressed, setPressed] = useState<Message | null>(null);

  const messages = conversation?.messages ?? [];
  const isEmpty = messages.length === 0;
  // F11: once Deborah has replied to a shared document, her questions replace the starter list.
  const docReplied = messages.some((m) => m.role === 'deborah' && m.meta?.documentId);
  // Intake V2 stays out of the way: the empty chat is only the orb and one question. The in-chat
  // intake shows only when she already started it (resume); otherwise the profile fills from Home
  // (M-2.10) and from Deborah's questions at the point of need.
  const intakeMode = intake.enabled && isEmpty && intake.progress.step !== 'consent' && intake.progress.step !== 'done';
  const aboutStep = intakeMode && intake.progress.step === 'about';
  const generating = busy && conversation?.status === 'generating';
  // Emergency locks the composer until the user acknowledges it (docs/ux/F03-safety.md).
  const emergencyOpen = conversation?.status === 'safety' && messages.some((m) => m.kind === 'emergency' && !m.meta?.acknowledged);
  const last = messages.at(-1);
  // Active question widgets live beside the question in the transcript. The composer remains
  // available for the existing typed-answer path; other intake screens retain their own controls.
  // The about-you step still needs free text, so it keeps the composer.
  // Opened from "Complete your health profile": stay blank until Deborah's first question lands,
  // never flashing the empty-chat greeting or suggestions.
  const profileOpening = Boolean(startIntake) && isEmpty;
  const profiling = (conversation?.status === 'intake' || (intakeMode && !aboutStep) || profileOpening) && !emergencyOpen;
  const quizMsg = [...messages].reverse().find((m) => m.kind === 'intakeQuestion');
  // Wheel fields (year/height/weight) own the UI; `text` is composer-only (F02d) and still counts as quiz.
  const fieldWheel = quizMsg?.intake?.input && quizMsg.intake.input !== 'text';
  const quiz =
    conversation?.status === 'intake' && !busy && Boolean(quizMsg?.intake) && !fieldWheel &&
    !quizMsg?.intake?.answered && !quizMsg?.intake?.skipped && !quizMsg?.meta?.streaming
      ? quizMsg?.intake
      : undefined;
  const quizFreeText = Boolean(quiz && (quiz.input === 'text' || quiz.options.length === 0));
  // Expand / gate choice questions own the UI — composer only after Other or for free-text.
  const hideComposerForChoices = Boolean(quiz && !quizFreeText && intakeSurface === 'choices');
  const { ref: scrollRef, onScroll, showLatest, toBottom } = useAutoScroll(`${intake.progress.step}:${messages.length}:${last?.text?.length}:${JSON.stringify(last?.answer?.sections.map((s) => s.body.length + (s.bullets?.length ?? 0)))}:${conversation?.thinking}`);

  useEffect(() => () => setChromeHidden(false), [setChromeHidden]);
  // The follow-up opt-in (M-2.8) waited for Review and Confirm; offer it once every fact is handled.
  const reviewOpen = pendingFacts(conversation).length > 0;
  const finishReview = chat.finishReview;
  useEffect(() => {
    if (busy || reviewOpen || conversation?.status === 'error' || conversation?.status === 'safety' || conversation?.gentleNext || conversation?.providerReview?.state !== 'waiting') return;
    finishReview();
  }, [busy, reviewOpen, conversation?.status, conversation?.gentleNext, conversation?.providerReview?.state, finishReview]);

  useEffect(() => {
    if (!conversation?.followUpAfterReview || reviewOpen) return;
    const s = useAppStore.getState();
    s.setConversation(conversation.id, { followUpAfterReview: false });
    if (s.notificationPermission === 'unknown') presentSheet('M-2.8');
  }, [conversation?.followUpAfterReview, conversation?.id, reviewOpen, presentSheet]);
  // Home's first-visit sheet ("Complete your profile") lands straight on Deborah's first onboarding
  // question (`startIntake`): no greeting screen in between (design direction 2026-10-12).
  const profileStarted = useRef(false);
  const startProfile = chat.startProfile;
  useEffect(() => {
    if (!startIntake || profileStarted.current || messages.length > 0 || busy) return;
    profileStarted.current = true;
    startProfile();
  }, [startIntake, messages.length, busy, startProfile]);

  useEffect(() => {
    if (focus || prefill) inputRef.current?.focus();
  }, [focus, prefill]);

  // F02d: free-text session questions — put focus in the composer (no inline type pill).
  useEffect(() => {
    if (quizFreeText) inputRef.current?.focus();
  }, [quizFreeText, quiz?.questionId]);

  const chatSend = chat.send;
  const consent = useHealthConsent();
  const askConsent = consent.ask;
  const send = useCallback(
    async (text: string, scriptId?: string) => {
      const t = text.trim();
      if (!t) return;
      // Step C: the composer answers "tell me about yourself" instead of starting a consultation.
      if (aboutStep) {
        setDraft('');
        return void intake.submitAbout(t);
      }
      if (intakeMode && intake.progress.step === 'done') intake.close();
      setDraft('');
      toBottom();
      // Free-text session Q, expand "Other…", or hybrid Other: composer answers the current question.
      // Exception (F02e): “Tell me what you think” must request guidance (early look / answer), not fill Other.
      if (
        quiz &&
        !asksForAnswer(t) &&
        (quizFreeText ||
          Boolean(quiz.expandOptions?.length) ||
          quiz.options.some((o) => o.id === 'other'))
      ) {
        return void chat.answerIntake(quiz.questionId, ['other'], t);
      }
      // After sign-up's health basics: consent alert first, so Deborah can answer directly.
      await askConsent();
      // Gated by the free limit: the message stays in the composer (F04).
      const accepted = await chatSend(t, scriptId);
      if (!accepted) setDraft(t);
    },
    [chatSend, toBottom, aboutStep, intakeMode, intake, quiz, quizFreeText, chat, askConsent],
  );

  const { interceptFocus } = useReturnFlows({ startCheckIn: chat.startCheckIn, startDebrief: chat.startDebrief, send, status: conversation?.status, busy, atBottom: !showLatest });
  useDocumentHandoff({ shareDocument: chat.shareDocument, offerDocument: chat.offerDocument, status: conversation?.status, busy });

  const onFocusChange = (f: boolean) => {
    if (f && interceptFocus()) return inputRef.current?.blur();
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
  // Someone else's chat: quick start questions in third person, using their pronouns.
  const suggestions = !other
    ? suggestionsData.default
    : thirdPerson(minor ? suggestionsData.teen : suggestionsData.family, name, profile?.intake?.pronouns);

  return (
    <div className={styles.root} data-xref="M-2.1 · Conversation">
      {/* Same living backdrop as Home (M-2.0), so chat feels like the same space. */}
      <Aura />
      <GradientShift />
      <ChatHeader
        onBack={() => pop()}
        onNewChat={() => chat.startNew()}
        canStartNew={!isEmpty && !profiling}
        scrolled={underBar}
        profile={profile ? { name, onPress: openSwitcher } : undefined}
      />

      <div
        ref={scrollRef}
        className={styles.scroll}
        onScroll={(e) => {
          onScroll();
          // Hysteresis so the edge effect doesn’t flicker the purple wash on/off near the top.
          const y = e.currentTarget.scrollTop;
          setUnderBar((on) => (on ? y > 2 : y > 12));
        }}
      >
        <div className={styles.column} data-empty={isEmpty || undefined}>
          {intakeMode ? (
            <IntakeFlow flow={intake} onScan={(field) => presentSheet('M-2.9', { field })} onPick={(t) => send(t)} />
          ) : isEmpty ? (
            !profileOpening && (() => {
              const last = history[0];
              const g = greeting(name || 'there', now, last?.topic ?? last?.summary, other);
              return (
                <Greeting
                  line={other && name ? `How is ${name} feeling today?` : undefined}
                  welcomeBack={g.welcomeBack}
                  onContinue={g.welcomeBack ? () => chat.continueLast() : undefined}
                />
              );
            })()
          ) : (
            conversation && (
              <MessageList
                conversation={conversation}
                busy={busy}
                chat={chat}
                actions={actions}
                onShop={(id) => open('M-2.7', { productId: id })}
                onBook={() => push('M-8.2')}
                onUploadLabs={() => gate('documents', () => open('M-5.3'))}
                onRestartPlan={() => gate('journey', () => {
                  switchTab('health');
                  push('M-7.3');
                })}
                onVisitNotes={() => {
                  const msg = [...(conversation?.messages ?? [])].reverse().find((m) => m.kind === 'answer' && m.answer);
                  if (msg) actions.saveAnswer(msg, conversation?.topic ?? 'your question');
                  else open('M-9.4');
                }}
                onOpenPlan={() => {
                  switchTab('health');
                  push('M-7.3');
                }}
                onTeamBook={() => {
                  toast('Summary sent to Deborah’s team (demo)');
                  push('M-8.2');
                }}
                onLongPress={setPressed}
                onFocusComposer={() => inputRef.current?.focus()}
                onIntakeAnswerSurface={setIntakeSurface}
                onEditFacts={() => presentSheet('M-2.13', { conversationId: conversation.id })}
              />
            )
          )}
          {consent.widget}
        </div>
      </div>

      <div className={styles.bottom}>
        {showLatest && !isEmpty && <ScrollToLatest onPress={() => toBottom(true)} />}
        {(isEmpty || conversation?.status === 'empty') && !docReplied && !intakeMode && !profileOpening && !recording && (
          <SuggestionList suggestions={suggestions} onSelect={(x) => send(x.text, x.scriptId)} />
        )}
        {safetyBench && !emergencyOpen && <SafetyBench onInsert={(phrase) => { setDraft(phrase); inputRef.current?.focus(); }} />}
        {(!profiling || Boolean(quiz)) && !hideComposerForChoices && <Composer
          value={draft}
          onChange={setDraft}
          onSend={(text) => send(text ?? draft)}
          onStop={chat.stop}
          onAttach={(source) => gate('documents', () => open('M-5.3', { source }))}
          onSymptoms={() => setSymptomsOpen(true)}
          onFocusChange={onFocusChange}
          generating={generating}
          lockedNote={emergencyOpen ? 'Please get help first.' : undefined}
          inputRef={inputRef}
          placeholder={
            aboutStep
              ? ABOUT_PLACEHOLDER
              : quizFreeText
                ? quiz?.placeholder
                  ? quiz.placeholder
                  : quiz?.questionId === 'session-goal'
                  ? 'Type your goal…'
                  : quiz?.questionId === 'session-concern'
                    ? 'Type your main concern…'
                    : 'Type your answer…'
                : quiz?.expandOptions?.length
                  ? quiz.questionId === 'session-meds'
                    ? 'Or type a medication…'
                    : 'Or type another issue…'
                : quiz
                  ? 'Or type something else…'
                  : conversation?.status === 'intake'
                    ? 'Or type your answer…'
                    : 'Ask me anything'
          }
          onRecordingChange={setRecording}
          voiceSample={aboutStep ? ABOUT_VOICE_SAMPLE : chat.voiceSample}
          // Trial counter hidden for now (design direction 2026-10-08); the free-limit sheet still gates.
          banner={SHOW_TRIAL_COUNTER && freeLeft !== null && <TrialCounter inline left={freeLeft} onChoosePlan={() => open('M-4.1')} />}
        />}
      </div>

      <SymptomPicker open={symptomsOpen} onClose={() => setSymptomsOpen(false)} onAdd={(xs) => { setDraft((d) => withSymptoms(d, xs)); inputRef.current?.focus(); }} />
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
