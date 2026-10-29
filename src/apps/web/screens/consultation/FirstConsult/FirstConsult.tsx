/**
 * @screen  M-2.12 · First conversation (scripted)
 * @flow    F02 Core consultation — genesis_first_consult_v1 after onboarding (M-1.9), or with `flow: 'returning'`
 *          the signed-in demo genesis_returning_consult_demo (from Home's Ask Deborah, seed R01)
 * @states  opener · context · clarifier 1–3 · safety (red flag) · thinking · 7-section answer · follow-up ·
 *          visit prep · check-in opt-in · close
 * @figma   —
 * @spec    data/conversation/flows/firstConsult.json (OPEN: add to docs/ux/F02)
 * @xref    web: W-2.12 — not built
 *
 * A prebuilt Q&A, no live LLM: the script lives in JSON and plays through useFlowPlayer, drawn with the
 * chat's own patterns. The first tap asks for health-data consent (as in M-2.1). Leaving the script for
 * free chat opens the normal conversation (M-2.1).
 * OPEN: "DRAFT. All Deborah-voice copy, tests and product guidance need Deborah's clinical sign-off."
 * OPEN: the script's facts (night sweats, levothyroxine…) are its sample person's, not this user's answers.
 */
import type { Appointment } from './parts/AppointmentForm';
import { VisitNoteCard } from '@web/patterns/health';
import { useComposerAttachments } from '@web/patterns/chat';
import { meta } from '@web/navigation';
import { useEffect, useRef, useState } from 'react';
import { firstConsultFlow, proxyConsultFlow, returningConsultFlow, sandraConsultFlow } from '@shared/data';
import { briefFromAnswer, visitBriefPreview } from '@shared/engine';
import { nowFrom, uid } from '@shared/utils';
import { SELF_PROFILE_ID, selectActiveProfile, useAppStore } from '@shared/store';
import type { FlowNode, FlowOption } from '@shared/types/flow';
import { DeborahBlob } from '@web/ui';
import { ChatHeader, Composer, SuggestionList, SymptomPicker, ThinkingIndicator, withSymptoms } from '@web/patterns/chat';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useNavStore, useScreenParams } from '@web/navigation';
import { useHealthConsent } from '@web/screens/consultation/Conversation/parts/useHealthConsent';
import { EntryView } from './parts/EntryView';
import { VisitPrepCard } from './parts/VisitPrepCard';
import { buildAnswer, visitPrepItems } from './parts/buildAnswer';
import { useFlowPlayer } from './parts/useFlowPlayer';
import { useAutoScroll } from '@web/screens/consultation/Conversation/parts/useAutoScroll';
import { useProfileContext } from './parts/profileContext';
import { useProxyContext } from './parts/proxyContext';
import styles from './FirstConsult.module.css';

const EXITS: Record<string, string> = { '/book': 'M-8.2', '/shop/genesis-gold': 'M-2.7' };

export default function FirstConsult() {
  // `flow: 'returning'`: the signed-in demo (Maria, seed R01) instead of the first consultation.
  // `flow: 'sandra'`: the premade first chat a new sign-up lands in (Sandra, 46, perimenopause happy path).
  // `flow: 'proxy'`: the premade caregiver chat (a daughter about her mother, Pathway C) for a female family profile.
  const { flow: which } = useScreenParams<{ flow: 'returning' | 'sandra' | 'proxy' }>();
  const profile = useAppStore(selectActiveProfile);
  const name = profile?.name ?? '';
  // Family/advocate must never run Sandra's first-person script (personalise → "How are you feeling today, {name}?").
  const advocate = Boolean(profile && profile.id !== SELF_PROFILE_ID);
  const resolved = which === 'sandra' && advocate ? 'proxy' : which;
  const flow = resolved === 'returning' ? returningConsultFlow : resolved === 'sandra' ? sandraConsultFlow : resolved === 'proxy' ? proxyConsultFlow : firstConsultFlow;
  const premade = resolved === 'sandra' || resolved === 'proxy';
  const { open, push, openAsk } = useNav();
  const toast = useToast();
  const consent = useHealthConsent();
  const askConsent = consent.ask;
  const needsReconsent = useAppStore((s) => Boolean(s.healthConsentRevoked && !s.healthConsentAt));
  const guest = useAppStore((s) => !s.accountId);
  const chatVisible = useNavStore((s) => {
    if (s.root !== 'main' || s.activeTab !== 'ask' || s.layers.length > 0) return false;
    const id = s.tabs.ask.at(-1)?.id;
    return id === 'M-2.1' || id === 'M-2.12';
  });
  // After revoke, the next time this chat is in front, ask again before she can continue.
  useEffect(() => {
    if (chatVisible && needsReconsent) void askConsent();
  }, [chatVisible, needsReconsent, askConsent]);
  // The first consultation reads the sign-up profile so Deborah never re-asks it (docs/ux/F02c).
  const profileCtx = useProfileContext();
  const proxyCtx = useProxyContext();
  const player = useFlowPlayer(flow, name, !resolved ? profileCtx : resolved === 'proxy' ? proxyCtx : undefined, premade ? resolved : undefined);
  const { entries, typing } = player;
  const asked = useRef(false);
  const [draft, setDraft] = useState('');
  // Picked symptoms ride as pills in the composer; they become words only when the message is sent.
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomSheet, setSymptomSheet] = useState(false);
  const withPicked = (text: string) => {
    if (!symptoms.length) return text;
    setSymptoms([]);
    return withSymptoms(text, symptoms);
  };
  const say = player.say;
  // A multi-choice answer in progress: picked pills mirror into the composer, sent with her words (or alone).
  const [held, setHeld] = useState<{ entryId: string; node: FlowNode; picked: FlowOption[] } | null>(null);
  const send = (text: string) => {
    if (!held?.picked.length) return typeInstead(withPicked(text));
    const words = withPicked(text).trim();
    setHeld(null);
    pick(held.entryId, held.node, words ? [...held.picked, { label: words, value: words }] : held.picked);
  };

  const prep = visitPrepItems(flow.nodes.answer_1);


  // Leaving the script: free chat opens the normal conversation; booking and shop open their screens.
  const last = entries.at(-1);
  useEffect(() => {
    if (last?.kind !== 'end' || !last.route || last.route === '/chat') return;
    const id = EXITS[last.route];
    if (id === 'M-8.2') push(id);
    else if (id) open(id, id === 'M-2.7' ? { productId: 'genesis-gold' } : undefined);
  }, [last, open, push]);

  const pick = async (entryId: string, node: FlowNode, picked: FlowOption[]) => {
    if (picked[0]?.next === 'chat_free') return openAsk({ focus: true });
    if (!asked.current && consent.needed()) {
      // Her words land first, Deborah answers in a line, and only then the consent card (design direction 2026-10-14).
      asked.current = true;
      player.echo(entryId, picked);
      await player.aside('Thank you for telling me. Before I look at this with you, I’d like to use the health details you shared, so my guidance fits you.');
      await consent.ask();
      return player.respond(entryId, node, picked, true);
    }
    asked.current = true;
    player.respond(entryId, node, picked);
    // Premade chats: some answers leave for an app screen (provider notes, the full intake).
    const route = picked.length === 1 && picked[0].next ? flow.nodes[picked[0].next]?.route : undefined;
    if (route === '/visit-notes') action('visit_notes');
    if (route === '/intake') push('M-2.14');
  };
  // The answer the notes are built from: the one on screen, else the path's own (`m_` mood, `s_` premade).
  const answerNode = () =>
    [...entries].reverse().find((e) => e.kind === 'answer')?.node ??
    (entries.some((e) => e.kind === 'bot' && e.nodeId.startsWith('m_')) ? flow.nodes.m_answer : undefined) ??
    (entries.some((e) => e.kind === 'bot' && e.nodeId.startsWith('s_')) ? flow.nodes.s_answer : undefined) ??
    (entries.some((e) => e.kind === 'bot' && e.nodeId.startsWith('p_')) ? flow.nodes.p_answer : undefined) ??
    flow.nodes.answer_1;
  const saveProviderBrief = (): string | undefined => {
    const s = useAppStore.getState();
    const profile = selectActiveProfile(s);
    if (!profile) {
      toast('No active profile');
      return undefined;
    }
    const node = answerNode();
    const answer = buildAnswer(node, say);
    const title = node.notesTitle ? say(node.notesTitle) : undefined;
    const brief = {
      ...briefFromAnswer(profile, answer, title ?? 'First conversation'),
      ...(title && { title }),
      ...(appointment?.provider && { providerName: appointment.provider }),
      ...(appointment?.specialty && { providerSpecialty: appointment.specialty }),
      ...(appointment?.date && { appointmentDate: new Date(`${appointment.date}T12:00:00`).toISOString() }),
    };
    const id = uid('n');
    s.addNote({
      id,
      profileId: profile.id,
      kind: 'provider-brief',
      title: title ?? 'For my provider',
      body: visitBriefPreview(brief),
      brief,
      updatedAt: nowFrom(s).toISOString(),
    });
    return id;
  };

  const action = (value: string) => {
    if (value === 'book_request') return toast('Request sent. Watch your email.');
    if (value.startsWith('book:')) { toast(`Holding ${value.slice(5)} with the Oracle`); return push('M-8.2'); }
    // Miro Step 5: Visit prep / §7 save land on the structured provider brief (M-9.7).
    if (value === 'visit_notes' || value === 'save') {
      const id = saveProviderBrief();
      if (id) {
        open('M-9.7', { noteId: id });
        toast('Saved to My Visit Notes');
      }
      return;
    }
    if (value === 'exit_product') return open('M-2.7', { productId: 'genesis-gold' });
    if (value === 'complete_intake' || value === 'edit_profile') return push('M-2.14');
    if (value === 'pdf') {
      const id = saveProviderBrief();
      if (id) open('M-9.6', { briefNoteId: id });
      return;
    }
    toast(value === 'call' ? 'Calling 911 (simulated)' : value === 'find_care' ? 'Finding care near you (simulated)' : 'Saved to My Health');
  };
  // Typing instead of tapping leaves the script for free chat, carrying what she typed.
  // Premade chat (Sandra): whatever she types answers the question on screen and the script carries on,
  // so it feels live. Other scripts leave for free chat, carrying what she typed.
  const typeInstead = (text: string) => {
    const t = text.trim();
    if (!t) return;
    if (premade && waiting?.kind === 'bot' && (waiting.node.type === 'question' || waiting.node.display === 'greeting')) {
      setDraft('');
      return pick(waiting.id, waiting.node, [{ label: t, value: t }]);
    }
    openAsk({ prefill: t, focus: true });
  };
  const started = entries.some((e) => e.kind === 'user');
  // The held safety note sits after the answer but never takes the turn: the answer's follow-ups stay live.
  const waiting = [...entries].reverse().find((e) => (e.kind === 'bot' || e.kind === 'answer') && !e.answered && !(e.kind === 'bot' && e.node.type === 'safety'));
  // Standard chat scrolling, shared with M-2.1: follow new content unless she scrolled up.
  const { ref: scrollRef, onScroll } = useAutoScroll(`${entries.length}:${typing}:${Boolean(consent.widget)}`);
  // The opening greeting's starters dock above the composer until she answers.
  const opener = !started && waiting?.kind === 'bot' && waiting.node.display === 'greeting' ? waiting : undefined;
  const starters = opener?.node.widget?.options ?? [];

  const [appointment, setAppointment] = useState<Appointment>();
  const notesStarted = useRef(false);
  // Create visit notes stays in the thread: appointment yes/no, then the form, then the notes card.
  const startVisitNotes = () => {
    if (notesStarted.current || !flow.nodes.appointment) return;
    notesStarted.current = true;
    player.go('appointment');
  };
  const noteDate = (isoDay?: string) => {
    const d = isoDay ? new Date(`${isoDay}T12:00:00`) : nowFrom(useAppStore.getState());
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const attachments = useComposerAttachments('M-2.12', meta('M-2.12')?.title ?? 'First conversation');
  return (
    <div className={styles.root} data-xref="M-2.12 · First conversation">
      <ChatHeader
        disclosure={started}
        onNewChat={() => openAsk()}
        canStartNew={started}
        guest={guest}
        onSignIn={() => open('M-4.3', { mode: 'signin' })}
        onSignUp={() => open('M-4.3')}
      />
      <div ref={scrollRef} className={styles.scroll} onScroll={onScroll}>
        <div className={styles.column} data-started={started || undefined} data-placeholder>
          {/* Before she answers: the orb and serif greeting sit centred, as on the empty chat (M-2.1). Once she
              answers, a small orb moves top left, the greeting becomes the first message and the chat runs on. */}
          <div className={styles.orb}><DeborahBlob size={started ? 48 : 112} label="The Oracle" /></div>
          {entries.map((e) => (
            <div key={e.id} data-entry={e.kind} className={styles.entry}>
            <EntryView
              entry={e}
              active={e === waiting}
              say={say}
              onPick={(node, picked) => { setHeld(null); pick(e.id, node, picked); }}
              selection={held?.entryId === e.id ? held.picked : undefined}
              onSelect={(node, picked) => setHeld({ entryId: e.id, node, picked })}
              onAction={action}
              onAppointment={setAppointment}
              onCreateVisitNotes={startVisitNotes}
              renderNotesCard={(title) => {
                const heading = answerNode().notesTitle ? say(answerNode().notesTitle) : title;
                const summary = [
                  appointment?.provider,
                  `${prep.questions.length + player.extraPrep.length} questions`,
                  prep.tests.length ? `${prep.tests.length} tests to ask about` : '',
                ].filter(Boolean).join(' · ');
                return (
                  <VisitNoteCard
                    date={noteDate(appointment?.date)}
                    title={heading}
                    detail={summary}
                    actionLabel="Open"
                    onOpen={() => action('visit_notes')}
                    onLog={() => action('visit_notes')}
                  />
                );
              }}
              renderPrep={() => (
                <VisitPrepCard
                  title={(e.kind === 'bot' && e.node.widget?.title) || 'For my next appointment'}
                  questions={[...prep.questions.map((q) => say(q)), ...player.extraPrep]}
                  tests={prep.tests}
                  onShare={() => action('pdf')}
                  onSave={() => action('save')}
                />
              )}
            />
            </div>
          ))}
          {consent.widget}
          {typing && <ThinkingIndicator label="The Oracle is writing…" />}
          {/* No "Keep talking with the Oracle" CTA at the end (design 2026-10-21): the composer is right there. */}
        </div>
      </div>
      <div className={styles.bottom}>
        {opener && starters.length > 0 && (
          <div className={styles.starters}>
          <SuggestionList
            suggestions={starters.map((o) => ({ id: o.label, text: say(o.label), scriptId: '' }))}
            onSelect={(x) => pick(opener.id, opener.node, starters.filter((o) => o.label === x.id))}
          />
          </div>
        )}
        <SymptomPicker open={symptomSheet} onClose={() => setSymptomSheet(false)} onAdd={(xs) => setSymptoms((cur) => [...cur, ...xs.filter((x) => !cur.includes(x))])} />
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={(text) => {
            const n = attachments.items.length;
            const typed = text ?? draft;
            attachments.clear();
            send(typed.trim() || (n ? (n > 1 ? `I’ve attached ${n} files.` : 'I’ve attached a file.') : typed));
          }}
          onStop={() => {}}
          // Camera / Upload drop straight into the composer — no lab processing (design 2026-10-21).
          onAttach={attachments.attach}
          attachments={attachments.items}
          onRemoveAttachment={attachments.remove}
          // Symptoms open the SymptomPicker sheet (search + close, area tabs, pills).
          onSymptoms={() => setSymptomSheet(true)}
          symptomsActive={symptoms.length > 0}
          tokens={[...(held?.picked.map((o) => say(o.label)) ?? []), ...symptoms]}
          onRemoveToken={(t) => {
            setSymptoms((xs) => xs.filter((x) => x !== t));
            if (held) setHeld({ ...held, picked: held.picked.filter((o) => say(o.label) !== t) });
          }}
          onFocusChange={() => {}}
          generating={typing}
          placeholder="Or tell me in your own words…"
          voiceSample=""
        />
      </div>
      {attachments.overlay}
    </div>
  );
}
