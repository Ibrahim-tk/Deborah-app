/**
 * @screen  M-2.12 · First consultation (scripted)
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
import { useEffect, useRef, useState } from 'react';
import { firstConsultFlow, returningConsultFlow } from '@shared/data';
import { briefFromAnswer, visitBriefPreview } from '@shared/engine';
import { nowFrom, uid } from '@shared/utils';
import { selectActiveProfile, useAppStore } from '@shared/store';
import type { FlowNode, FlowOption } from '@shared/types/flow';
import { Button, DeborahBlob } from '@mobile/ui';
import { Aura, GradientShift } from '@mobile/ui';
import { ChatHeader, Composer, SuggestionList, SymptomPicker, ThinkingIndicator, withSymptoms } from '@mobile/patterns/chat';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useScreenParams } from '@mobile/navigation';
import { useHealthConsent } from '@mobile/screens/consultation/Conversation/parts/useHealthConsent';
import { EntryView } from './parts/EntryView';
import { VisitPrepCard } from './parts/VisitPrepCard';
import { buildAnswer, visitPrepItems } from './parts/buildAnswer';
import { useFlowPlayer } from './parts/useFlowPlayer';
import { useAutoScroll } from '@mobile/screens/consultation/Conversation/parts/useAutoScroll';
import { useProfileContext } from './parts/profileContext';
import styles from './FirstConsult.module.css';

const EXITS: Record<string, string> = { '/labs/upload': 'M-5.3', '/book': 'M-8.2', '/shop/genesis-gold': 'M-2.7' };

export default function FirstConsult() {
  // `flow: 'returning'`: the signed-in demo (Maria, seed R01) instead of the first consultation.
  const { flow: which } = useScreenParams<{ flow: 'returning' }>();
  const flow = which === 'returning' ? returningConsultFlow : firstConsultFlow;
  const { pop, open, push, openAsk } = useNav();
  const toast = useToast();
  const consent = useHealthConsent();
  const name = useAppStore((s) => selectActiveProfile(s)?.name ?? '');
  // The first consultation reads the sign-up profile so Deborah never re-asks it (docs/ux/F02c).
  const profileCtx = useProfileContext();
  const player = useFlowPlayer(flow, name, which === 'returning' ? undefined : profileCtx);
  const { entries, typing } = player;
  const asked = useRef(false);
  const [draft, setDraft] = useState('');
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const say = player.say;

  const prep = visitPrepItems(flow.nodes.answer_1);


  // Leaving the script: free chat opens the normal conversation; labs, booking and shop open their screens.
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
  };
  const saveProviderBrief = (): string | undefined => {
    const s = useAppStore.getState();
    const profile = selectActiveProfile(s);
    if (!profile) {
      toast('No active profile');
      return undefined;
    }
    const answer = buildAnswer(flow.nodes.answer_1, say);
    const brief = briefFromAnswer(profile, answer, 'First consultation');
    const id = uid('n');
    s.addNote({
      id,
      profileId: profile.id,
      kind: 'provider-brief',
      title: 'For my provider',
      body: visitBriefPreview(brief),
      brief,
      updatedAt: nowFrom(s).toISOString(),
    });
    return id;
  };

  const action = (value: string) => {
    if (value.startsWith('book:')) { toast(`Holding ${value.slice(5)} with Deborah`); return push('M-8.2'); }
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
    if (value === 'pdf') {
      const id = saveProviderBrief();
      if (id) open('M-9.6', { briefNoteId: id });
      return;
    }
    toast(value === 'call' ? 'Calling 911 (simulated)' : value === 'find_care' ? 'Finding care near you (simulated)' : 'Saved to My Health');
  };
  // Typing instead of tapping leaves the script for free chat, carrying what she typed.
  const typeInstead = (text: string) => {
    if (text.trim()) openAsk({ prefill: text.trim(), focus: true });
  };
  const started = entries.some((e) => e.kind === 'user');
  // The held safety note sits after the answer but never takes the turn: the answer's follow-ups stay live.
  const waiting = [...entries].reverse().find((e) => (e.kind === 'bot' || e.kind === 'answer') && !e.answered && !(e.kind === 'bot' && e.node.type === 'safety'));
  // Standard chat scrolling, shared with M-2.1: follow new content unless she scrolled up.
  const { ref: scrollRef, onScroll } = useAutoScroll(`${entries.length}:${typing}:${Boolean(consent.widget)}`);
  // The opening greeting's starters dock above the composer until she answers.
  const opener = !started && waiting?.kind === 'bot' && waiting.node.display === 'greeting' ? waiting : undefined;
  const starters = opener?.node.widget?.options ?? [];

  return (
    <div className={styles.root} data-xref="M-2.12 · First consultation">
      {/* Same living backdrop as Home (M-2.0), so chat feels like the same space. */}
      <Aura />
      <GradientShift />
      <ChatHeader onBack={pop} onNewChat={() => openAsk()} canStartNew />
      <div ref={scrollRef} className={styles.scroll} onScroll={onScroll}>
        <div className={styles.column} data-started={started || undefined} data-placeholder>
          {/* Before she answers: the orb and serif greeting sit centred, as on the empty chat (M-2.1). Once she
              answers, a small orb moves top left, the greeting becomes the first message and the chat runs on. */}
          <div className={styles.orb}><DeborahBlob size={started ? 48 : 112} label="Deborah" /></div>
          {entries.map((e) => (
            <div key={e.id} data-entry={e.kind} className={styles.entry}>
            <EntryView
              entry={e}
              active={e === waiting}
              say={say}
              onPick={(node, picked) => pick(e.id, node, picked)}
              onAction={action}
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
          {typing && <ThinkingIndicator label="Deborah is writing…" />}
          {last?.kind === 'end' && last.route === '/chat' && (
            <Button fullWidth onClick={() => openAsk({ focus: true })}>Keep talking with Deborah</Button>
          )}
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
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={(text) => typeInstead(text ?? draft)}
          onStop={() => {}}
          onAttach={() => open('M-5.3')}
          onSymptoms={() => setSymptomsOpen(true)}
          onFocusChange={() => {}}
          generating={typing}
          placeholder="Or tell me in your own words…"
          voiceSample=""
        />
      </div>
      <SymptomPicker open={symptomsOpen} onClose={() => setSymptomsOpen(false)} onAdd={(xs) => setDraft((d) => withSymptoms(d, xs))} />
    </div>
  );
}
