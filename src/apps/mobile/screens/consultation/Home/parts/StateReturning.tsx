/**
 * Home · State 2 — returning. Order (design 2026-10-20): last conversation · intake if unfinished, else
 * the healing plan · Manage your health details · shop.
 */
import { HealingPlanCard, HomeMediaHero, IntakeCompletionCard, type NextIntent, type Recommendation } from '@mobile/patterns/widgets';
import { HomeSections } from './HomeSections';

export type NextStep = NextIntent;

export interface StateReturningProps {
  when?: string;
  topic: string;
  summary?: string;
  pendingQuestion?: string;
  onContinue: () => void;
  steps: NextStep[];
  journey?: { concern?: string; done: number; total: number; onPress: () => void };
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
  onNotes: () => void;
}

export function StateReturning(p: StateReturningProps) {
  const heroTopic = p.topic.replace(/^Your /i, '').replace(/^./, (c) => c.toUpperCase());

  return (
    <>
      <HomeMediaHero titleId="continue-deborah" eyebrow="Continue your conversation" title={heroTopic}
        tone="hero" artifact="violet-bloom" ctaLabel="Continue" onCta={p.onContinue} />
      {p.intakeCard && !p.intakeCard.complete ? (
        <IntakeCompletionCard progress={p.intakeCard.progress} onAction={p.intakeCard.onAction} />
      ) : (
        p.journey && <HealingPlanCard concern={p.journey.concern} done={p.journey.done} total={p.journey.total} onPress={p.journey.onPress} />
      )}
      <HomeSections {...p} />
    </>
  );
}
