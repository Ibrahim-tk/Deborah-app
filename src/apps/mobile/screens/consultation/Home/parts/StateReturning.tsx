/**
 * Home · State 2 — returning. Order (design 2026-10-20): last conversation · intake if unfinished, else
 * the healing plan · records · My health + Family · shop.
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
  journey?: { day: number; today?: string; focus?: string; onPress: () => void };
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  reports?: { meta: string; onPress: () => void };
  /** F11 Documents and reports (M-11.1). */
  documents?: { meta: string; onPress: () => void };
  onLabs: () => void;
  destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateReturning(p: StateReturningProps) {
  const heroTitle =
    p.summary?.replace(/^[·\s]+/, '').trim()
    || `Ongoing ${p.topic.replace(/^Your /i, '').toLowerCase()} and questions about your health`;

  return (
    <>
      <HomeMediaHero titleId="continue-deborah" title={heroTitle} when={p.when} tone="hero" artifact="violet-bloom" ctaLabel="Continue" onCta={p.onContinue} />
      {p.intakeCard && !p.intakeCard.complete ? (
        <IntakeCompletionCard progress={p.intakeCard.progress} onAction={p.intakeCard.onAction} />
      ) : (
        p.journey && <HealingPlanCard day={p.journey.day} focus={p.journey.focus} todayHabit={p.journey.today} onPress={p.journey.onPress} />
      )}
      <HomeSections {...p} />
    </>
  );
}
