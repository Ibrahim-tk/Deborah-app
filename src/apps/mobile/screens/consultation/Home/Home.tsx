/**
 * @screen  M-2.0 · Home
 * @flow    F02 Core consultation (landing)
 * @states  1 new / skipped chat · 2 returning after a chat · 3 a few weeks in (see parts/State*.tsx)
 *          · guest (avatar dot; save card after the first chat) · account
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=191-3398
 * @spec    intake V2 brief §7 (design direction 2026-10-12) — OPEN: not in docs/ux/F02 yet
 * @xref    web: W-2.0 — not built
 */
import { useEffect, useState } from 'react';
import { FLAGS } from '@shared/flags';
import { useAppStore } from '@shared/store';
import { Aura, GradientShift, ScrollEdge } from '@mobile/ui';
import { ChatLauncher, ConversationHeader } from '@mobile/patterns/chat';
import { useNav, useNavStore } from '@mobile/navigation';
import { useAccountGate } from '@mobile/hooks/useAccountGate';
import { GreetingSheet } from './parts/GreetingSheet';
import { SaveProgressCard } from './parts/SaveProgressCard';
import { StateNew } from './parts/StateNew';
import { StateReturning, type NextStep } from './parts/StateReturning';
import { StateEstablished } from './parts/StateEstablished';
import type { TileProps } from './parts/HomeKit';
import { useHomeView } from './parts/useHomeView';
import { useHubData } from '@mobile/screens/myhealth/useHubData';
import { useAddMember } from '@mobile/screens/profiles/useAddMember';
import styles from './Home.module.css';

/** Profiles that have already seen the first-visit greeting this session (in memory only). */
const greeted = new Set<string>();
const GREETING_DELAY_MS = 1500;

export default function Home() {
  const { open, push, presentSheet, presentModal, setSidebarOpen, switchTab } = useNav();
  const openAsk = useNavStore((s) => s.openAsk);
  const gate = useAccountGate();
  const { add: addMember } = useAddMember();
  const d = useHomeView();
  const { profile, active, history, isNew } = d;
  const { profileId, focus } = useHubData();
  const guest = useAppStore((s) => !s.accountId);
  const nudgeDismissedAt = useAppStore((s) => s.saveNudgeDismissedAt);
  const eligible = isNew && !!profile && !greeted.has(profile.id);
  const [sheet, setSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
  const subline = d.state === 'returning' ? `Ready to pick up on ${d.topic.charAt(0).toLowerCase()}${d.topic.slice(1)}?` : undefined;

  const chats = history.length + (active?.messages.length ? 1 : 0);
  const showSaveCard = guest && chats > 0 && (nudgeDismissedAt === undefined || chats > nudgeDismissedAt);
  const saveProfile = () => presentSheet('M-4.3', { sheet: true });

  const closeSheet = () => {
    if (profile) greeted.add(profile.id);
    setSheet(false);
  };
  const chat = () => {
    closeSheet();
    if (active?.messages.length) push('M-2.1');
    else openAsk({ focus: true });
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
  const openProfile = () => presentModal('M-2.10');
  const journey = () => gate('journey', () => push('M-7.3'));
  const shop = (productId: string) => open('M-2.7', { productId });
  const reports = d.reportsMeta ? { meta: d.reportsMeta, onPress: go('M-9.1') } : undefined;
  const tiles: [TileProps, TileProps] = [
    { tone: 'linen', title: 'My Health', meta: FLAGS.intakeV2 ? `Profile ${pct}%` : 'Your plan & library', progress: FLAGS.intakeV2 ? d.completion : undefined, onPress: go('M-7.2') },
    { tone: 'rose', title: 'Family', meta: `${d.profileCount} profile${d.profileCount === 1 ? '' : 's'}`, onPress: go('M-6.6') },
  ];

  // Next steps fill the profile over time, one tap each (State 2).
  const steps: NextStep[] = [];
  if (d.checkInDue) steps.push({ key: 'checkin', title: 'Check in with Deborah', sub: 'Tell her how things are going', onPress: () => openAsk({ mode: 'checkin' }) });
  if (FLAGS.intakeV2 && !d.profile?.health?.medications) steps.push({ key: 'meds', title: 'Add your current medications', sub: 'So Deborah can check interactions', onPress: openProfile });
  if (d.reports.length === 0) steps.push({ key: 'labs', title: 'Upload your recent labs', sub: 'She’ll read them alongside your symptoms', onPress: () => open('M-5.3') });
  if (FLAGS.intakeV2 && d.intakeDone) {
    for (const x of d.deferred) steps.push({ key: x.key, title: `Add ${x.label.charAt(0).toLowerCase()}${x.label.slice(1)}`, sub: 'Helps Deborah tailor her guidance', onPress: () => presentSheet('M-2.11', { topic: x.key }) });
  }
  for (const q of d.steps) steps.push({ key: `q:${q}`, title: q, sub: 'Ask Deborah', onPress: () => openAsk({ prefill: q }) });

  return (
    <div className={styles.root} data-xref="M-2.0 · Home">
      <Aura />
      <GradientShift />
      <ScrollEdge active={scrolled} />
      <div className={styles.top}>
        <ConversationHeader title="" transparent onMenu={() => setSidebarOpen(true)} onNotifications={() => push('M-10.4')}
          profile={{ name, guest, onPress: guest ? saveProfile : () => switchTab('account') }} />
      </div>

      <div className={styles.scroll} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}>
        <div className={styles.intro}>
          <p className={styles.date}>{today}</p>
          <h1 className={styles.hello}>{heading}</h1>
          {subline && <p className={styles.subline}>{subline}</p>}
        </div>

        {showSaveCard && <SaveProgressCard onSave={saveProfile} onDismiss={() => useAppStore.getState().dismissSaveNudge()} />}

        {d.state === 'new' && (
          <StateNew
            onPrompt={(prefill) => { closeSheet(); openAsk({ prefill }); }}
            profile={FLAGS.intakeV2 && !d.intakeDone ? { progress: d.completion, onOpen: openProfile } : undefined}
            onAddFamily={() => addMember(false)}
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
            journey={d.planDay ? { day: d.planDay, today: d.nextHabit, onPress: journey } : undefined}
            reports={reports}
            tiles={tiles}
            recommendations={d.recommendations}
            onShop={shop}
          />
        )}
        {d.state === 'established' && d.planDay && (
          <StateEstablished
            day={d.planDay}
            habits={d.habits}
            onToggle={(id) => useAppStore.getState().toggleHabit(profileId, id, d.today)}
            continueMeta={d.checkInDue ? 'Your check-in is due' : d.when ? `Last chat ${d.when} · ${d.topic}` : undefined}
            onContinue={d.checkInDue ? () => openAsk({ mode: 'checkin' }) : resume}
            onJourney={journey}
            reports={reports}
            tiles={tiles}
            recommendations={d.recommendations}
            onShop={shop}
          />
        )}
      </div>

      <div className={styles.dock}>
        <ChatLauncher glow placeholder="Ask Deborah how you’re feeling…" onOpen={chat} />
      </div>

      {sheet && <GreetingSheet name={name} onDismiss={closeSheet} onOpenChat={chat} />}
    </div>
  );
}
