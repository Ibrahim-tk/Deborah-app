/**
 * @screen  M-2.0 · Home
 * @flow    F02 Core consultation (landing)
 * @states  first visit (greeting sheet; the sheet holds the chat bar — Home has no composer) · returning · has history (continue)
 * @figma   — not in wireframes yet
 * @spec    design direction 2026-10-08 — OPEN: not in docs/ux/F02 yet
 * @xref    web: W-2.0 — not built
 */
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { productList } from '@shared/data';
import { greeting } from '@shared/engine';
import { selectActiveConversation, selectHistory, useAppStore } from '@shared/store';
import { nowFrom } from '@shared/utils';
import { Aura, ScrollEdge } from '@mobile/ui';
import { ConversationHeader } from '@mobile/patterns/chat';
import { ShopTiles } from '@mobile/patterns/commerce';
import { useProfileSwitcher } from '@mobile/hooks/useProfileSwitcher';
import { useNav, useNavStore } from '@mobile/navigation';
import { DestinationCards } from './parts/DestinationCards';
import { GreetingSheet } from './parts/GreetingSheet';
import { HomeToday } from './parts/HomeToday';
import styles from './Home.module.css';

/** Profiles that have already seen the first-visit greeting this session (in memory only). */
const greeted = new Set<string>();
const GREETING_DELAY_MS = 1500;

export default function Home() {
  const { open, push, setSidebarOpen } = useNav();
  const openAsk = useNavStore((s) => s.openAsk);
  const openSwitcher = useProfileSwitcher();
  const profile = useAppStore((s) => s.profiles.byId[s.activeProfileId]);
  const active = useAppStore(selectActiveConversation);
  const history = useAppStore(useShallow(selectHistory));
  const profileCount = useAppStore((s) => s.profiles.order.length);
  const clock = useAppStore(
    useShallow((s) => ({ simulatedNow: s.simulatedNow, clockAnchor: s.clockAnchor })),
  );
  const isNew = history.length === 0 && !active?.messages.length;
  const eligible = isNew && !!profile && !greeted.has(profile.id);
  const [sheet, setSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Let Home settle first: the greeting slides up ~1.5 s after landing.
  useEffect(() => {
    if (!eligible) return;
    const id = window.setTimeout(() => setSheet(true), GREETING_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [eligible]);

  const name = profile?.name ?? '';
  const g = greeting(name, nowFrom(clock), history[0]?.topic, false);

  const closeSheet = () => {
    if (profile) greeted.add(profile.id);
    setSheet(false);
  };
  const chat = () => {
    closeSheet();
    // Resume the open conversation if there is one; otherwise start focused.
    if (active?.messages.length) push('M-2.1');
    else openAsk({ focus: true });
  };
  // Cards stack their screen on top of Home, so every destination gets a Back button.
  const go = (id: string) => () => push(id);

  return (
    <div className={styles.root} data-xref="M-2.0 · Home">
      <Aura reach={0.45} />
      {/* Floats over the scroll like an iOS nav bar; the edge effect blurs content passing beneath. */}
      <ScrollEdge active={scrolled} />
      <div className={styles.top}>
        <ConversationHeader
          title=""
          transparent
          onMenu={() => setSidebarOpen(true)}
          profileName={profile?.name}
          onSwitchProfile={openSwitcher}
        />
      </div>

      <div className={styles.scroll} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}>
        <div className={styles.intro}>
          <h1 className={styles.hello}>{g.line}</h1>
          <p className={styles.sub}>{g.question}</p>
        </div>

        <DestinationCards
          askHint="Ask Deborah how you’re feeling…"
          onAsk={chat}
          health={{
            title: 'My Health',
            meta: 'Your plan & library',
            onSelect: go('M-7.2'),
            crop: '48% 42%',
          }}
          records={{
            title: 'Records',
            meta: history.length
              ? `${history.length} consultation${history.length === 1 ? '' : 's'}`
              : 'View all',
            onSelect: go('M-9.1'),
            crop: '30% 70%',
            hue: -12,
          }}
          family={{
            title: 'Family',
            meta: `${profileCount} profile${profileCount === 1 ? '' : 's'}`,
            onSelect: go('M-6.6'),
            crop: '75% 25%',
            hue: 14,
          }}
          onInfo={go('M-10.1')}
          today={<HomeToday />}
        />

        <div className={styles.shop}>
          <ShopTiles products={productList} onShop={(id) => open('M-2.7', { productId: id })} />
        </div>
      </div>

      {sheet && <GreetingSheet name={name} onDismiss={closeSheet} onOpenChat={chat} />}
    </div>
  );
}
