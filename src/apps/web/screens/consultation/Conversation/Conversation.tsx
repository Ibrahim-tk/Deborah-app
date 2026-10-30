/**
 * @screen  M-2.1 · Conversation
 * @flow    F02 Core consultation (also hosts F03 safety states, F05 check-in, F06 profile chat)
 * @states  intake V2 (consent · connecting · about · reading · confirm · hand-off) · empty · focused · intake · ready · generating · answered · follow-up reply · error · stopped · gated · checkin · lab-informed answer
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=48-361
 * @spec    docs/ux/F02-consultation.md#m-21-conversation
 * @xref    web: W-2.1 (apps/web/screens/consultation/Conversation) — not built
 */
import { HeldChoiceContext, useComposerAttachments, type HeldChoice } from '@web/patterns/chat';
import { meta } from '@web/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { asksForAnswer, isMinor, pendingFacts } from '@shared/engine';
import { suggestionsData } from '@shared/data';
import { thirdPerson } from './parts/thirdPerson';
import { selectActiveConversation, SELF_PROFILE_ID, useAppStore } from '@shared/store';
import type { Message } from '@shared/types/domain';
import { nowFrom, uid } from '@shared/utils';
import { ActionSheet, AnimatePresence, MotionDiv } from '@web/ui';
import { AI_DISCLOSURE, ChatHeader, Composer, Greeting, ScrollToLatest, SuggestionList, SymptomPicker, TrialCounter, withSymptoms } from '@web/patterns/chat';
import { useConversation } from '@web/hooks/useConversation';
import { useNav, useNavStore, useScreenParams } from '@web/navigation';
import { MessageList } from './parts/MessageList';
import { ABOUT_PLACEHOLDER, ABOUT_VOICE_SAMPLE, IntakeFlow, useIntakeFlow } from './parts/IntakeFlow';
import { SafetyBench } from './parts/SafetyBench';
import { useAutoScroll } from './parts/useAutoScroll';
import { useReturnFlows } from './parts/useReturnFlows';
import { useDocumentHandoff } from './parts/useDocumentHandoff';
import { useMessageActions } from './parts/useMessageActions';
import { useHealthConsent } from './parts/useHealthConsent';
import { VisitNotesThread } from './parts/VisitNotesThread';
import { NotePreview } from '@web/screens/records/Records/parts/NotePreview';
import { IntakeCompletionCard } from '@web/patterns/widgets';
import { useHomeView } from '@web/screens/consultation/Home/parts/useHomeView';
import styles from './Conversation.module.css';
import { useAccountGate } from '@web/hooks/useAccountGate';
import { useToast } from '@web/hooks/toast.store';

const CLOSING_ONBOARD = 'Okay, let’s start chatting…';

const SHOW_TRIAL_COUNTER = false;

export default function Conversation() {
  // Visit-notes flow + side preview belong to the conversation they were started in.
  const activeConversationId = useAppStore((st) => selectActiveConversation(st)?.id);
  const [visitNotesFor, setVisitNotesFor] = useState<string>();
  const visitNotes = Boolean(activeConversationId) && visitNotesFor === activeConversationId;
  const setVisitNotes = (on: boolean) => setVisitNotesFor(on ? activeConversationId : undefined);
  const [preview, setPreview] = useState<{ conv?: string; noteId: string }>();
  const previewNoteId = preview && preview.conv === activeConversationId ? preview.noteId : undefined;
  const chat = useConversation();
  const { conversation, profile, freeLeft, busy } = chat;
  const { open, push, pop, switchTab, presentSheet } = useNav();
  // Same intake nudge as Home: floats bottom-right on the empty chat until the profile is complete.
  const intakeCompletion = useHomeView().completion;
  const gate = useAccountGate();
  const toast = useToast();
  const intake = useIntakeFlow();
  const setChromeHidden = useNavStore((s) => s.setChromeHidden);
  // Set by nav.openAsk(): M-7.4 "Ask Oracle about this" (prefill), M-7.1 "Start my first conversation" (focus).
  // `onboardClosing`: guest signup finished HealthBasics — closing line then flush held send.
  const { prefill, focus, onboardClosing } = useScreenParams<{ prefill: string; focus: boolean; onboardClosing: boolean }>();
  const guest = useAppStore((s) => !s.accountId);
  const setRouteParams = useNavStore((s) => s.setRouteParams);
  const routeKey = useNavStore((s) => s.tabs.ask.at(-1)?.key);
  // Picked symptoms ride as pills in the composer; they become words only when the message is sent.
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomSheet, setSymptomSheet] = useState(false);
  // Multi-choice answers held in the composer (design 2026-10-21, same as M-2.12).
  const [held, setHeld] = useState<HeldChoice | null>(null);
  const heldValue = useMemo(() => ({ held, setHeld }), [held]);
  const attachments = useComposerAttachments('M-2.1', meta('M-2.1')?.title ?? 'Conversation');
  const withPicked = (text: string) => {
    if (!symptoms.length) return text;
    setSymptoms([]);
    return withSymptoms(text, symptoms);
  };
  const [underBar, setUnderBar] = useState(false);
  /** F02d: while expand/gate pills are active, hide the bottom composer until Other. */
  const [, setIntakeSurface] = useState<'choices' | 'composer'>('composer');
  const safetyBench = useAppStore((s) => s.qa.safetyBench);
  // Tone Guide: signup → 3 chips; login → 4. Same gate as Home new vs returning.
  const isLogin = useAppStore((s) => s.authFlow === 'login');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Miro Step 5 “No” branch: back to Ask Oracle with the composer ready.
  const actions = useMessageActions(profile?.id, () => inputRef.current?.focus());

  const [draft, setDraft] = useState(prefill ?? '');
  const [pressed, setPressed] = useState<Message | null>(null);

  const messages = conversation?.messages ?? [];
  const isEmpty = messages.length === 0;
  // First message: stay on this screen — the greeting lifts away and the message rises into place.
  const [arriving, setArriving] = useState(false);
  const wasEmpty = useRef(isEmpty);
  useEffect(() => {
    if (wasEmpty.current && !isEmpty) {
      setArriving(true);
      const id = window.setTimeout(() => setArriving(false), 900);
      wasEmpty.current = isEmpty;
      return () => window.clearTimeout(id);
    }
    wasEmpty.current = isEmpty;
  }, [isEmpty]);
  // F11: once Oracle has replied to a shared document, her questions replace the starter list.
  // Intake V2 stays out of the way: the empty chat is only the orb and one question. The in-chat
  // intake shows only when she already started it (resume); otherwise the profile fills from Home
  // (My Health card, M-7.2) and from Oracle's questions at the point of need.
  const intakeMode = intake.enabled && isEmpty && intake.progress.step !== 'consent' && intake.progress.step !== 'done';
  const aboutStep = intakeMode && intake.progress.step === 'about';
  const generating = busy && conversation?.status === 'generating';
  // Emergency locks the composer until the user acknowledges it (docs/ux/F03-safety.md).
  const emergencyOpen = conversation?.status === 'safety' && messages.some((m) => m.kind === 'emergency' && !m.meta?.acknowledged);
  const last = messages.at(-1);
  // Active question widgets live beside the question in the transcript. The composer remains
  // available for the existing typed-answer path; other intake screens retain their own controls.
  // The about-you step still needs free text, so it keeps the composer.
  // Opened from "Complete your health profile": stay blank until Oracle's first question lands,
  // never flashing the empty-chat greeting or suggestions.
  const profiling = (conversation?.status === 'intake' || (intakeMode && !aboutStep)) && !emergencyOpen;
  const quizMsg = [...messages].reverse().find((m) => m.kind === 'intakeQuestion');
  // Wheel fields (year/height/weight) own the UI; `text` is composer-only (F02d) and still counts as quiz.
  const fieldWheel = quizMsg?.intake?.input && quizMsg.intake.input !== 'text';
  const quiz =
    conversation?.status === 'intake' && !busy && Boolean(quizMsg?.intake) && !fieldWheel &&
    !quizMsg?.intake?.answered && !quizMsg?.intake?.skipped && !quizMsg?.meta?.streaming
      ? quizMsg?.intake
      : undefined;
  const quizFreeText = Boolean(quiz && (quiz.input === 'text' || quiz.options.length === 0));
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
  useEffect(() => {
    if (focus || prefill) inputRef.current?.focus();
  }, [focus, prefill]);

  // After guest HealthBasics: Deborah closing line in-thread, then flush the held first message.
  useEffect(() => {
    if (!onboardClosing || !routeKey) return;
    setRouteParams(routeKey, { onboardClosing: undefined });
    const s = useAppStore.getState();
    const c = selectActiveConversation(s);
    if (c) {
      s.appendMessage(c.id, {
        id: uid('msg'),
        role: 'deborah',
        kind: 'text',
        createdAt: nowFrom(s).toISOString(),
        text: CLOSING_ONBOARD,
      });
    }
    if (s.heldMessage) s.releaseHeld();
  }, [onboardClosing, routeKey, setRouteParams]);

  // F02d: free-text session questions — put focus in the composer (no inline type pill).
  useEffect(() => {
    if (quizFreeText) inputRef.current?.focus();
  }, [quizFreeText, quiz?.questionId]);

  const chatSend = chat.send;
  const consent = useHealthConsent();
  const askConsent = consent.ask;
  const needsReconsent = useAppStore((s) => Boolean(s.healthConsentRevoked && !s.healthConsentAt));
  const chatVisible = useNavStore((s) => {
    if (s.root !== 'main' || s.activeTab !== 'ask' || s.layers.length > 0) return false;
    return s.tabs.ask.at(-1)?.id === 'M-2.1';
  });
  // After revoke, ask when this chat is the screen in front. A send waits on the same sheet.
  useEffect(() => {
    if (chatVisible && needsReconsent) void askConsent();
  }, [chatVisible, needsReconsent, askConsent]);
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
      // Guest: send so Oracle starts thinking, then open the auth gate over the thread.
      if (guest) {
        const accepted = await chatSend(t, scriptId);
        if (!accepted) setDraft(t);
        presentSheet('M-4.0', { mode: 'create' });
        return;
      }
      // After sign-up's health basics: consent alert first, so Oracle can answer directly.
      await askConsent();
      // Gated by the free limit: the message stays in the composer (F04).
      const accepted = await chatSend(t, scriptId);
      if (!accepted) setDraft(t);
    },
    [chatSend, toBottom, aboutStep, intakeMode, intake, quiz, quizFreeText, chat, askConsent, guest, presentSheet],
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
  // F06: family/advocate chat — third-person suggestions + advocate greeting.
  const other = !!profile && (profile.id !== SELF_PROFILE_ID || profile.relationship !== 'self');
  const minor = profile ? isMinor(profile) : false;
  const suggestions = !other
    ? isLogin
      ? suggestionsData.returning
      : suggestionsData.newSignup
    : thirdPerson(minor ? suggestionsData.teen : suggestionsData.family, name, profile);
  // Someone else's chat: quick start questions in third person, using their pronouns.
  // Empty chat: orb + heading, composer, then suggestions — one centered group.
  // Profile card can be closed for this visit (designer, 2026-10-29).
  const [intakeCardClosed, setIntakeCardClosed] = useState(false);
  const emptyStart = isEmpty && !intakeMode;

  const composer = (
    <Composer
      value={draft}
      onChange={setDraft}
      onSend={(text) => {
        // Multi-choice picks held in the composer: Send submits them (as in M-2.12); typed text stays for later.
        if (held?.ids.length) {
          held.finish(held.ids);
          setHeld(null);
          return;
        }
        const typed = withPicked(text ?? draft);
        // Photos / files: post them as images, "Reading your photo…", then a placeholder reply (dummy).
        if (attachments.items.length) {
          const items = attachments.items.map((a) => ({ name: a.name, src: a.image }));
          attachments.clear();
          setDraft('');
          chat.shareAttachments(items, typed);
          return;
        }
        send(typed);
      }}
      onStop={chat.stop}
      onAttach={(source) => gate('documents', () => attachments.attach(source))}
      attachments={attachments.items}
      onRemoveAttachment={attachments.remove}
      // Symptoms open the SymptomPicker sheet (search + close, area tabs, pills).
      onSymptoms={() => setSymptomSheet(true)}
      symptomsActive={symptoms.length > 0}
      tokens={[...(held?.labels ?? []), ...symptoms]}
      onRemoveToken={(t) => {
        if (held?.labels.includes(t)) {
          const ids = held.ids.filter((_, i) => held.labels[i] !== t);
          setHeld(ids.length ? { ...held, ids, labels: held.labels.filter((x) => x !== t) } : null);
          return;
        }
        setSymptoms((xs) => xs.filter((x) => x !== t));
      }}
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
      voiceSample={aboutStep ? ABOUT_VOICE_SAMPLE : chat.voiceSample}
      // Trial counter hidden for now (design direction 2026-10-08); the free-limit sheet still gates.
      banner={SHOW_TRIAL_COUNTER && freeLeft !== null && <TrialCounter inline left={freeLeft} onChoosePlan={() => open('M-4.1')} />}
    />
  );

  return (
    <HeldChoiceContext.Provider value={heldValue}>
    <div className={styles.root} data-xref="M-2.1 · Conversation" data-start={emptyStart || undefined} data-preview={previewNoteId ? '' : undefined}>
      {/* Side preview (artifact-style): the chat slides left, the note opens on the right; Close returns. */}
      {previewNoteId && (
        <aside className={styles.preview} aria-label="Visit notes preview">
          <div className={styles.previewBody}>
            <NotePreview noteId={previewNoteId} onClear={() => setPreview(undefined)} />
          </div>
        </aside>
      )}
      <ChatHeader
        onBack={() => pop()}
        onNewChat={() => chat.startNew()}
        canStartNew={!isEmpty && !profiling}
        scrolled={underBar}
        guest={guest}
        onSignIn={() => presentSheet('M-4.0', { mode: 'signin' })}
        onSignUp={() => presentSheet('M-4.0', { mode: 'create' })}
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
        <div className={styles.column} data-empty={isEmpty || undefined} data-start={emptyStart || undefined} data-arriving={arriving || undefined}>
          <div className={emptyStart ? styles.emptyCluster : styles.stack}>
          {/* popLayout: the greeting animates out of the flow while the conversation takes its place. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {intakeMode ? (
              <IntakeFlow flow={intake} onScan={(field) => presentSheet('M-2.9', { field })} onPick={(t) => send(t)} />
            ) : isEmpty ? (
              <MotionDiv key="greeting" className={styles.greetingWrap} exit={{ opacity: 0, y: -40, scale: 0.97, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } }}>
                <Greeting
                  line={other && name ? `Tell me how’s ${name} feeling today?` : undefined}
                />
              </MotionDiv>
            ) : (
              conversation && (
                <MessageList
                  conversation={conversation}
                  busy={busy}
                  chat={chat}
                  actions={actions}
                  onShop={(id) => open('M-2.7', { productId: id })}
                  onBook={() => open('M-8.2')}
                  onRestartPlan={() => gate('journey', () => {
                    switchTab('health');
                    push('M-7.3');
                  })}
                  // Web: Create visit notes runs in the thread (appointment → form → notes tile), as in M-2.12.
                  onVisitNotes={() => setVisitNotes(true)}
                  onOpenPlan={() => {
                    switchTab('health');
                    push('M-7.3');
                  }}
                  onTeamBook={() => {
                    toast('Summary sent to the support team (demo)');
                    open('M-8.2');
                  }}
                  onLongPress={setPressed}
                  onFocusComposer={() => inputRef.current?.focus()}
                  onIntakeAnswerSurface={setIntakeSurface}
                  onEditFacts={() => open('M-2.13', { conversationId: conversation.id })}
                />
              )
            )}
          </AnimatePresence>
          {emptyStart && composer}
          {emptyStart && intakeCompletion < 1 && !intakeCardClosed && (
            <div className={styles.intakeFloat}>
              <IntakeCompletionCard layout="stack" progress={intakeCompletion} onAction={() => push('M-2.14')} onDismiss={() => setIntakeCardClosed(true)} />
            </div>
          )}
          {emptyStart && (
            <SuggestionList suggestions={suggestions} onSelect={(x) => send(x.text, x.scriptId)} />
          )}
          {visitNotes && !emptyStart && (
            <VisitNotesThread
              answer={[...(conversation?.messages ?? [])].reverse().find((m) => m.kind === 'answer' && m.answer)?.answer}
              topic={conversation?.topic ?? 'My Visit Notes'}
              onOpenNotes={(id) => (id ? setPreview({ conv: activeConversationId, noteId: id }) : open('M-9.1'))}
            />
          )}
          </div>
        </div>
      </div>

      {/* Must stay mounted on empty chat: first chip/send awaits askConsent → MedicalConsentSheet. */}
      {consent.widget}

      <div className={styles.bottom}>
        {showLatest && !isEmpty && <ScrollToLatest onPress={() => toBottom(true)} />}
        {safetyBench && !emergencyOpen && <SafetyBench onInsert={(phrase) => { setDraft(phrase); inputRef.current?.focus(); }} />}
        {/* The composer never leaves the chat (design 2026-10-20): during intake and choice questions it stays,
            and typing there answers "Other". Empty chat lifts it into the centered group. */}
        <SymptomPicker open={symptomSheet} onClose={() => setSymptomSheet(false)} onAdd={(xs) => setSymptoms((cur) => [...cur, ...xs.filter((x) => !cur.includes(x))])} />
        {!emptyStart && composer}
        {/* AI disclosure under the composer, as on mobile (designer, 2026-10-29). */}
        {!emptyStart && <p className={styles.aiDisclosure}>{AI_DISCLOSURE}</p>}
      </div>

      {attachments.overlay}
      <ActionSheet
        open={Boolean(pressed)}
        onClose={() => setPressed(null)}
        actions={[
          { label: 'Copy', onSelect: () => pressed && actions.copyText(pressed.text ?? '') },
          { label: 'Save to Visit Notes', onSelect: () => pressed && actions.saveMessage(pressed) },
        ]}
      />
    </div>
    </HeldChoiceContext.Provider>
  );
}
