/**
 * Home · State 2 — returning after a chat (Figma 171:145).
 * AI-native overhaul: PrimaryIntentCard + NextIntentList; callbacks unchanged.
 */
import { Button } from '@mobile/ui';
import {
  DestinationTilePair,
  HealingPlanCard,
  IntakeCompletionCard,
  LinkStatusCard,
  NextIntentList,
  type NextIntent,
  PrimaryIntentCard,
  RecommendationCard,
  type Recommendation,
  type DestinationTileProps,
} from '@mobile/patterns/widgets';

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
  tiles: [DestinationTileProps, DestinationTileProps];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateReturning(p: StateReturningProps) {
  return (
    <>
      <PrimaryIntentCard
        titleId="continue-deborah"
        title={p.topic}
        body={p.summary}
        kicker={`Continue with Deborah${p.when ? ` · ${p.when}` : ''}`}
        kickerIcon="chat"
        pending={p.pendingQuestion}
      >
        <Button fullWidth onClick={p.onContinue}>Continue</Button>
      </PrimaryIntentCard>

      <NextIntentList items={p.steps} />

      {p.intakeCard && (
        <IntakeCompletionCard progress={p.intakeCard.progress} complete={p.intakeCard.complete} onAction={p.intakeCard.onAction} />
      )}

      {p.journey && (
        <HealingPlanCard
          day={p.journey.day}
          todayHabit={p.journey.today}
          focus={p.journey.focus}
          onPress={p.journey.onPress}
        />
      )}

      {p.reports && (
        <LinkStatusCard tone="lilac" lead="labs" title="Reports" meta={p.reports.meta} onPress={p.reports.onPress} />
      )}

      <DestinationTilePair tiles={p.tiles} />

      <RecommendationCard items={p.recommendations} onShop={p.onShop} />
    </>
  );
}
