/**
 * Home · State 3 — established (plan running). Order (design 2026-10-20): last conversation · intake if
 * unfinished, else today's habits · records · My health + Family · shop.
 */
import { HomeMediaHero, IntakeCompletionCard, TodayHabitsCard, type Recommendation, type TodayHabit } from '@mobile/patterns/widgets';
import { HomeSections, type Destinations } from './HomeSections';

export type { TodayHabit };

export interface StateEstablishedProps {
  day: number;
  habits: TodayHabit[];
  onToggle: (habitId: string) => void;
  continueMeta?: string;
  onContinue: () => void;
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  reports?: { meta: string; onPress: () => void };
  documents?: { meta: string; onPress: () => void };
  onLabs: () => void;
  destinations: Destinations;
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateEstablished(p: StateEstablishedProps) {
  return (
    <>
      <HomeMediaHero
        titleId="continue-deborah"
        title={p.continueMeta ?? 'Ongoing conversation and questions with Deborah'}
        tone="hero"
        artifact="violet-bloom"
        ctaLabel="Continue"
        onCta={p.onContinue}
      />
      {p.intakeCard && !p.intakeCard.complete ? (
        <IntakeCompletionCard progress={p.intakeCard.progress} onAction={p.intakeCard.onAction} />
      ) : (
        <TodayHabitsCard day={p.day} habits={p.habits} onToggle={p.onToggle} />
      )}
      <HomeSections {...p} />
    </>
  );
}
