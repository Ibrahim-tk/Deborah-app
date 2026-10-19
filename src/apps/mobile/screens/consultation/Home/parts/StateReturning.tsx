/**
 * Home · State 2 — returning. Artifact continue hero + intent-matched next steps.
 */
import {
  GlassCareStrip,
  HealingPlanCard,
  HomeMediaHero,
  IntakeCompletionCard,
  PhotoDestinationPair,
  RecommendationCard,
  SuggestionCarousel,
  artifactForIntent,
  type NextIntent,
  type Recommendation,
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
  /** F11 Documents and reports (M-11.1). */
  documents?: { meta: string; onPress: () => void };
  destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];
  recommendations: Recommendation[];
  onShop: (productId: string) => void;
}

export function StateReturning(p: StateReturningProps) {
  const care: { key: string; label: string; meta?: string; onPress: () => void }[] = [];
  if (p.reports) {
    care.push({
      key: 'reports',
      label: 'Reports',
      meta: p.reports.meta,
      onPress: p.reports.onPress,
    });
  }
  if (p.documents) care.push({ key: 'documents', label: 'Documents', meta: p.documents.meta, onPress: p.documents.onPress });

  const heroTitle =
    p.summary?.replace(/^[·\s]+/, '').trim()
    || `Ongoing ${p.topic.replace(/^Your /i, '').toLowerCase()} and questions about your health`;

  return (
    <>
      <HomeMediaHero
        titleId="continue-deborah"
        title={heroTitle}
        when={p.when}
        tone="hero"
        artifact="violet-bloom"
        ctaLabel="Continue"
        onCta={p.onContinue}
      />

      <SuggestionCarousel
        label="Next steps"
        items={p.steps.map((s) => {
          const art = artifactForIntent(s.key, s.title);
          return {
            key: s.key,
            title: s.title,
            sub: s.sub,
            tone: art.tone,
            artifact: art.artifact,
            icon: s.icon,
            onPress: s.onPress,
          };
        })}
      />

      <GlassCareStrip items={care} />

      {p.intakeCard && !p.intakeCard.complete && (
        <IntakeCompletionCard
          progress={p.intakeCard.progress}
          onAction={p.intakeCard.onAction}
        />
      )}

      {p.journey && (
        <HealingPlanCard
          day={p.journey.day}
          focus={p.journey.focus}
          todayHabit={p.journey.today}
          onPress={p.journey.onPress}
        />
      )}

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
