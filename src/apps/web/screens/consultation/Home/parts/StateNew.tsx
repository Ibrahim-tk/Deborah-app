/**
 * Home · State 1 — new user. After her first chat (design 2026-10-20), in order: Continue your chat ·
 * Complete your intake · My health and Family · shop. Before any chat, the hero starts one instead.
 */
import { HomeMediaHero, type Recommendation } from '@web/patterns/widgets';
import { HomeSections } from './HomeSections';

export interface StateNewProps {
  /** Opens chat with the Oracle (no chat yet). */
  onStart: () => void;
  /** Set once she has chatted: the hero picks the chat back up. */
  chat?: { title?: string; when?: string; onContinue: () => void };
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
  onNotes: () => void;
}

export function StateNew({ onStart, chat, destinations, recommendations, onShop, onNotes }: StateNewProps) {
  return (
    <>
      {chat ? (
        <HomeMediaHero
          titleId="continue-chat"
          eyebrow="Continue your conversation"
          title={chat.title || 'Your last conversation'}
          when={chat.when}
          tone="hero"
          artifact="violet-bloom"
          ctaLabel="Continue"
          onCta={chat.onContinue}
        />
      ) : (
        <HomeMediaHero
          titleId="start-deborah"
          title="Start with the Oracle"
          eyebrow="New"
          tone="hero"
          artifact="violet-bloom"
          ctaLabel="Start a conversation"
          onCta={onStart}
        />
      )}

      <HomeSections onNotes={onNotes} destinations={destinations} recommendations={recommendations} onShop={onShop} hideShop />
    </>
  );
}
