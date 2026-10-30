/**
 * @screen  M-2.0 · Home
 * @flow    F02 Core consultation (landing)
 * @states  new (just signed up) · returning (every login) — see parts/State*.tsx
 *          · account (sign-up comes before onboarding, so there's no guest save prompt — plan P-10)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=191-3398
 * @spec    intake V2 brief §7 (design direction 2026-10-12) — OPEN: not in docs/ux/F02 yet
 * @xref    mobile: apps/mobile/screens/consultation/Home
 */
import { useEffect, useState } from 'react';
import { FLAGS } from '@shared/flags';
import { selectIsTeenAccount, selectVisitToLog, useAppStore } from '@shared/store';

import { ChatLauncher, ConversationHeader } from '@web/patterns/chat';
import { IntakeCompletionCard } from '@web/patterns/widgets';
import { useNav, useNavStore } from '@web/navigation';
import { useAccountGate } from '@web/hooks/useAccountGate';
import { GreetingSheet } from './parts/GreetingSheet';
import { StateNew } from './parts/StateNew';
import { StateReturning, type NextStep } from './parts/StateReturning';
import { useHomeView } from './parts/useHomeView';

import { useHubData } from '@web/screens/myhealth/useHubData';
import styles from './Home.module.css';

/** Profiles that have already seen the first-visit greeting this session (in memory only). */
const greeted = new Set<string>();
const GREETING_DELAY_MS = 1500;

export default function Home() {
  const { open, push, presentSheet } = useNav();
  const openAsk = useNavStore((s) => s.openAsk);
  const gate = useAccountGate();
  const d = useHomeView();
  const { profile, history, isNew } = d;
  const { profileId, focus } = useHubData();
  // Not after sign-up's health basics (M-1.8): that form already hands over to the chat.
  const eligible = isNew && !!profile && !greeted.has(profile.id) && !d.intakeDone && !profile.intake.profileFor;
  const [sheet, setSheet] = useState(false);

  // First visit: Deborah's greeting sheet slides up ~1.5 s after landing.
  useEffect(() => {
    if (!eligible) return;
    const id = window.setTimeout(() => setSheet(true), GREETING_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [eligible]);

  const name = profile?.name ?? '';
  // The date comes from the device, not the simulated clock.
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  // Figma 191:3398: time-of-day greeting from the device clock; State 2 adds a line of context.
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const heading = `Good ${part}${name ? `, ${name}` : ''}.`;

  const closeSheet = () => {
    if (profile) greeted.add(profile.id);
    setSheet(false);
  };
  // Home composer always starts a new chat. Resume lives on the "Continue your chat" card.
  const chat = () => {
    closeSheet();
    useAppStore.getState().archiveActive(profileId);
    openAsk({ focus: true });
  };
  // Continue with Deborah: a half-answered intake question resumes exactly where it stopped.
  const resume = () => {
    if (d.midIntake) return push('M-2.1');
    const target = focus ?? history[0];
    if (!target) return;
    const s = useAppStore.getState();
    s.setConversation(target.id, { archived: false });
    s.setActiveConversation(profileId, target.id);
    openAsk();
  };
  const go = (id: string) => () => push(id);
  const pct = Math.round(d.completion * 100);
  // The health profile lives on My Health (its Health profile card); M-2.10 was removed (2026-10-20).
  const openProfile = () => push('M-7.2');
  const journey = () => gate('journey', () => push('M-7.3'));
  // Teen accounts have no Wellness Plan (F06 teen invite).
  const teen = useAppStore(selectIsTeenAccount);
  const completeIntake = () => push('M-2.14');
  const shop = (productId: string) => open('M-2.7', { productId });
  // Dismissed for this visit only; the card returns on the next Home mount.
  const [intakeHidden, setIntakeHidden] = useState(false);
  const intakeCard = {
    progress: d.completion,
    complete: d.completion >= 1,
    onAction: () => { closeSheet(); completeIntake(); },
  };
  const visitToLog = useAppStore((s) => selectVisitToLog(s));
  const destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }] = [
    { title: 'My Health', meta: FLAGS.intakeV2 ? `Profile ${pct}%` : 'Your plan & library', onPress: go('M-7.2') },
    { title: 'Add Family Member', meta: `${d.profileCount} profile${d.profileCount === 1 ? '' : 's'}`, onPress: go('M-6.6') },
  ];


  // Next steps fill the profile over time, one tap each (State 2).
  const steps: NextStep[] = [];
  // F09c: right after an appointment set in Step 5, logging it comes first.
  if (visitToLog) steps.push({ key: 'visit', icon: 'calendar', title: 'How did your visit go?', sub: 'Tell the Oracle what your provider said', onPress: () => openAsk({ mode: 'debrief', briefNoteId: visitToLog }) });
  if (d.checkInDue) steps.push({ key: 'checkin', icon: 'bell', title: 'Check in with the Oracle', sub: 'Tell her how things are going', onPress: () => openAsk({ mode: 'checkin' }) });
  if (FLAGS.intakeV2 && !d.profile?.health?.medications) steps.push({ key: 'meds', icon: 'medicine', title: 'Add your current medications', sub: 'So the Oracle can check interactions', onPress: openProfile });
  if (d.reports.length === 0) steps.push({ key: 'labs', icon: 'file', title: 'Share your recent lab values', sub: 'Type them into the chat as text', onPress: () => openAsk() });
  if (FLAGS.intakeV2 && d.intakeDone) {
    for (const x of d.deferred) steps.push({ key: x.key, icon: 'note', title: `Add ${x.label.charAt(0).toLowerCase()}${x.label.slice(1)}`, sub: 'Helps the Oracle tailor its guidance', onPress: () => presentSheet('M-2.11', { topic: x.key }) });
  }
  // F09c: log a provider visit any time.
  if (!visitToLog) steps.push({ key: 'logVisit', icon: 'note', title: 'Log a provider visit', sub: 'Keep what they said in My Visit Notes', onPress: () => openAsk({ mode: 'debrief' }) });
  for (const q of d.steps) steps.push({ key: `q:${q}`, icon: 'chat', title: q, sub: 'Ask Oracle', onPress: () => openAsk({ prefill: q }) });

  return (
    <div className={styles.root} data-xref="M-2.0 · Home">
      <div className={styles.top}>
        <ConversationHeader title="" transparent onNotifications={() => push('M-10.6')} />
      </div>

      <div className={styles.scroll}>
        <div className={styles.stage}>
          <div className={styles.intro}>
            <p className={styles.date}>{today}</p>
            <h1 className={styles.hello}>{heading}</h1>
          </div>

          {d.state === 'new' && (
            <StateNew
              onStart={() => { closeSheet(); openAsk({ focus: true }); }}
              chat={
                // Live Ask Deborah history only. Sandra/proxy premade flows stay off Home so suggestion
                // pills always mean Tone Guide dummy scripts on M-2.1, not a parallel first-consult story.
                history.length || d.midIntake ? { title: d.summary ?? d.topic, when: d.when, onContinue: () => { closeSheet(); resume(); } } : undefined
              }
              intakeCard={intakeCard}
              destinations={destinations}
              recommendations={d.recommendations}
              onShop={shop}
              onNotes={go('M-9.1')}
            />
          )}
          {d.state === 'returning' && (
            <StateReturning
              when={d.when}
              topic={d.midIntake ? 'Pick up your answers' : d.topic}
              summary={d.summary}
              pendingQuestion={d.pendingQuestion}
              onContinue={resume}
              steps={steps.slice(0, 3)}
              intakeCard={intakeCard}
              journey={d.planCard && !teen ? { concern: d.planCard.concern, done: d.planCard.done, total: d.planCard.total, onPress: journey } : undefined}
              onNotes={go('M-9.1')}
              destinations={destinations}
              recommendations={d.recommendations}
              onShop={shop}
            />
          )}
        </div>
      </div>

      {/* Intake nudge floats bottom-right over the dashboard (not inline in the card stack). */}
      {!intakeCard.complete && !intakeHidden && (
        <div className={styles.intakeFloat}>
          <IntakeCompletionCard layout="stack" progress={intakeCard.progress} onAction={intakeCard.onAction} onDismiss={() => setIntakeHidden(true)} />
        </div>
      )}
      <div className={styles.dock}>
        <div className={styles.dockInner}>
          <ChatLauncher glow placeholder="Tell the Oracle how you’re feeling…" onOpen={chat} />
        </div>
      </div>

      <GreetingSheet
        open={Boolean(sheet && eligible)}
        name={name}
        onDismiss={closeSheet}
        // Profile basics live in onboarding / Edit health profile, never in chat (design request 2026-10-21).
        onOpenChat={() => { closeSheet(); openAsk({ focus: true }); }}
      />
    </div>
  );
}
