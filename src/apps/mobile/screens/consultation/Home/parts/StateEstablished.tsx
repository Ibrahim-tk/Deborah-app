/**
 * Home · State 3 — established. Habits + artifact continue hero + destinations.
 */
import {
  GlassCareStrip,
  HealingPlanCard,
  HomeMediaHero,
  IntakeCompletionCard,
  PhotoDestinationPair,
  RecommendationCard,
  TodayHabitsCard,
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
  destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateEstablished(p: StateEstablishedProps) {
  const care: { key: string; label: string; meta?: string; onPress: () => void }[] = [];
  if (p.reports) {
    care.push({
      key: 'reports',
      label: 'Reports',
      meta: p.reports.meta,
      onPress: p.reports.onPress,
    });
  }

  return (
    <>
      <TodayHabitsCard day={p.day} habits={p.habits} onToggle={p.onToggle} />

      <HomeMediaHero
        titleId="continue-deborah"
        title={p.continueMeta ?? 'Ongoing conversation and questions with Deborah'}
        when={p.journeyFocus ? undefined : `Day ${p.day}`}
        tone="hero"
        artifact="violet-bloom"
        ctaLabel="Continue"
        onCta={p.onContinue}
      />

      <GlassCareStrip items={care} />

      {p.intakeCard && !p.intakeCard.complete && (
        <IntakeCompletionCard
          progress={p.intakeCard.progress}
          onAction={p.intakeCard.onAction}
        />
      )}

      <HealingPlanCard
        day={p.day}
        focus={p.journeyFocus}
        onPress={p.onJourney}
      />

      <PhotoDestinationPair
        tiles={[
          {
            title: p.destinations[0].title,
            meta: p.destinations[0].meta,
            tone: 'mint',
            artifact: 'dest-health-art',
            action: 'chevron',
            onPress: p.destinations[0].onPress,
          },
          {
            title: p.destinations[1].title,
            meta: p.destinations[1].meta,
            tone: 'rose',
            artifact: 'dest-family-art',
            action: 'plus',
            onPress: p.destinations[1].onPress,
          },
        ]}
      />

      <RecommendationCard items={p.recommendations} onShop={p.onShop} />
    </>
  );
}
