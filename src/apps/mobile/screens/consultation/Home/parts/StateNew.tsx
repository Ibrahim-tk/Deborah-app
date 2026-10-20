/**
 * Home · State 1 — new user. After her first chat (design 2026-10-20), in order: Continue your chat ·
 * Complete your intake · My health and Family · shop. Before any chat, the hero starts one instead.
 */
import { HomeMediaHero, IntakeCompletionCard, type Recommendation } from '@mobile/patterns/widgets';
import { HomeSections } from './HomeSections';

export interface StateNewProps {
  /** Opens chat with Deborah (no chat yet). */
  onStart: () => void;
  /** Set once she has chatted: the hero picks the chat back up. */
  chat?: { title?: string; when?: string; onContinue: () => void };
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
  reports?: { meta: string; onPress: () => void };
  documents?: { meta: string; onPress: () => void };
  onLabs: () => void;
}

export function StateNew({ onStart, chat, intakeCard, destinations, recommendations, onShop, reports, documents, onLabs }: StateNewProps) {
  return (
    <>
      {chat ? (
        <HomeMediaHero
          titleId="continue-chat"
          title="Continue your chat"
          meta={chat.title}
          when={chat.when}
          tone="hero"
          artifact="violet-bloom"
          ctaLabel="Continue"
          onCta={chat.onContinue}
        />
      ) : (
        <HomeMediaHero
          titleId="start-deborah"
          title="Start with Deborah"
          meta="Tell her what’s going on. She’ll ask a few questions, then share what she thinks."
          tone="hero"
          artifact="violet-bloom"
          ctaLabel="Start with Deborah"
          onCta={onStart}
        />
      )}

      {intakeCard && !intakeCard.complete && (
        <IntakeCompletionCard progress={intakeCard.progress} complete={intakeCard.complete} onAction={intakeCard.onAction} />
      )}

      <HomeSections reports={reports} documents={documents} onLabs={onLabs} destinations={destinations} recommendations={recommendations} onShop={onShop} />
    </>
  );
}
