/**
 * Home · State 1 — new user. After her first chat (design 2026-10-20), in order: Continue your chat ·
 * Complete your intake · My health and Family · shop. Before any chat, the hero starts one instead.
 */
import { HomeMediaHero, IntakeCompletionCard, type Recommendation } from '@mobile/patterns/widgets';
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

export function StateNew({ onStart, chat, intakeCard, destinations, recommendations, onShop, onNotes }: StateNewProps) {
  return (
    <>
      {chat ? (
        <HomeMediaHero
          titleId="continue-chat"
          eyebrow="Continue your conversation"
          title={chat.title || 'Your last conversation'}
          tone="hero"
          artifact="violet-bloom"
          ctaLabel="Continue"
          onCta={chat.onContinue}
        />
      ) : (
        <HomeMediaHero
          titleId="start-deborah"
          eyebrow="New"
          title="Start with the Oracle"
          tone="hero"
          artifact="violet-bloom"
          ctaLabel="Start a conversation"
          onCta={onStart}
        />
      )}

      {intakeCard && !intakeCard.complete && (
        <IntakeCompletionCard progress={intakeCard.progress} complete={intakeCard.complete} onAction={intakeCard.onAction} />
      )}

      <HomeSections onNotes={onNotes} destinations={destinations} recommendations={recommendations} onShop={onShop} />
    </>
  );
}
