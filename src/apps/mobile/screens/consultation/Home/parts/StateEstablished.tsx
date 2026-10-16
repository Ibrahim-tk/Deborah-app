/**
 * Home · State 3 — a few weeks in (Figma 172:145).
 * AI-native overhaul: TodayHabitsCard + shared destination widgets.
 */
import {
  DestinationTilePair,
  HealingPlanCard,
  IntakeCompletionCard,
  LinkStatusCard,
  RecommendationCard,
  TodayHabitsCard,
  type DestinationTileProps,
  type Recommendation,
  type TodayHabit,
} from '@mobile/patterns/widgets';

export type { TodayHabit };

export interface StateEstablishedProps {
  day: number;
  habits: TodayHabit[];
  onToggle: (habitId: string) => void;
  continueMeta?: string;
  onContinue: () => void;
  onJourney: () => void;
  journeyFocus?: string;
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  reports?: { meta: string; onPress: () => void };
  tiles: [DestinationTileProps, DestinationTileProps];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateEstablished(p: StateEstablishedProps) {
  return (
    <>
      <TodayHabitsCard day={p.day} habits={p.habits} onToggle={p.onToggle} />

      <LinkStatusCard
        tone="linen"
        lead="chat"
        title="Continue with Deborah"
        meta={p.continueMeta ?? 'Pick up where you left off'}
        onPress={p.onContinue}
      />
      {p.intakeCard && (
        <IntakeCompletionCard progress={p.intakeCard.progress} complete={p.intakeCard.complete} onAction={p.intakeCard.onAction} />
      )}
      <HealingPlanCard day={p.day} focus={p.journeyFocus} onPress={p.onJourney} />
      {p.reports && (
        <LinkStatusCard tone="lilac" lead="labs" title="Reports" meta={p.reports.meta} onPress={p.reports.onPress} />
      )}
      <DestinationTilePair tiles={p.tiles} compact />
      <RecommendationCard items={p.recommendations} onShop={p.onShop} />
    </>
  );
}
