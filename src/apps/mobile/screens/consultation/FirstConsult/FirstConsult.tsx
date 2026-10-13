/**
 * @screen  M-2.12 · First consultation (scripted)
 * @flow    F02 Core consultation — genesis_first_consult_v1, right after onboarding's "Let's talk" (M-1.9)
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
import { useEffect, useMemo, useRef } from 'react';
import { firstConsultFlow as flow } from '@shared/data';
import { personalise } from '@shared/engine';
import { selectActiveProfile, useAppStore } from '@shared/store';
import type { FlowNode, FlowOption } from '@shared/types/flow';
import { Button } from '@mobile/ui';
import { ChatHeader, ThinkingIndicator } from '@mobile/patterns/chat';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav } from '@mobile/navigation';
import { useHealthConsent } from '@mobile/screens/consultation/Conversation/parts/useHealthConsent';
import { EntryView } from './parts/EntryView';
import { VisitPrepCard } from './parts/VisitPrepCard';
import { visitPrepItems } from './parts/buildAnswer';
import { useFlowPlayer } from './parts/useFlowPlayer';
import styles from './FirstConsult.module.css';

const EXITS: Record<string, string> = { '/labs/upload': 'M-5.3', '/book': 'M-8.2', '/shop/genesis-gold': 'M-2.7' };

export default function FirstConsult() {
  const { pop, open, push, openAsk } = useNav();
  const toast = useToast();
  const consent = useHealthConsent();
  const name = useAppStore((s) => selectActiveProfile(s)?.name ?? '');
  const player = useFlowPlayer(flow, name);
  const { entries, typing } = player;
  const scrollRef = useRef<HTMLDivElement>(null);
  const asked = useRef(false);
  const say = (s?: string) => personalise(flow, s, name);

  // What she already told us at intake, shown on the "I already know" message.
  const known = useMemo(() => {
    const c = flow.carriedFromIntake as { meds?: { name: string }[] };
    return ['Night sweats', 'Low energy', ...(c.meds?.slice(0, 1).map((m) => m.name) ?? [])];
  }, []);
  const prep = visitPrepItems(flow.nodes.answer_1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length, typing]);

  // Leaving the script: free chat opens the normal conversation; labs, booking and shop open their screens.
  const last = entries.at(-1);
  useEffect(() => {
    if (last?.kind !== 'end' || !last.route || last.route === '/chat') return;
    const id = EXITS[last.route];
    if (id === 'M-8.2') push(id);
    else if (id) open(id, id === 'M-2.7' ? { productId: 'genesis-gold' } : undefined);
  }, [last, open, push]);

  const pick = async (entryId: string, node: FlowNode, picked: FlowOption[]) => {
    if (!asked.current) {
      asked.current = true;
      await consent.ask();
    }
    if (picked[0]?.next === 'chat_free') return openAsk({ focus: true });
    player.respond(entryId, node, picked);
  };
  const action = (value: string) => {
    if (value === 'exit_product') return open('M-2.7', { productId: 'genesis-gold' });
    toast(value === 'find_care' ? 'Finding care near you (simulated)' : value === 'pdf' ? 'PDF ready to share' : 'Saved to My Health');
  };
  const waiting = [...entries].reverse().find((e) => (e.kind === 'bot' || e.kind === 'answer') && !e.answered);

  return (
    <div className={styles.root} data-xref="M-2.12 · First consultation">
      <ChatHeader onBack={pop} onNewChat={() => openAsk()} onInfo={() => open('M-10.5', { section: 'ai' })} canStartNew={false} />
      <div ref={scrollRef} className={styles.scroll}>
        <div className={styles.column} data-placeholder>
          {entries.map((e) => (
            <EntryView
              key={e.id}
              entry={e}
              active={e === waiting}
              say={say}
              known={known}
              earlyExit={flow.uiDefaults.earlyExitLabel}
              onPick={(node, picked) => pick(e.id, node, picked)}
              onAction={action}
              renderPrep={() => (
                <VisitPrepCard
                  title={(e.kind === 'bot' && e.node.widget?.title) || 'For my next appointment'}
                  questions={[...prep.questions, ...player.extraPrep]}
                  tests={prep.tests}
                  onShare={() => action('pdf')}
                  onSave={() => action('save')}
                />
              )}
            />
          ))}
          {typing && <ThinkingIndicator label="Deborah is writing…" />}
          {last?.kind === 'end' && last.route === '/chat' && (
            <Button fullWidth onClick={() => openAsk({ focus: true })}>Keep talking with Deborah</Button>
          )}
        </div>
      </div>
      {consent.sheet}
    </div>
  );
}
