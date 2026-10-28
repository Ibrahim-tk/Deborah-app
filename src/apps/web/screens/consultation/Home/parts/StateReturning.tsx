/**
 * Home · State 2 — returning. Order: Continue hero · intake if unfinished · essentials · more for you.
 */
import { HomeMediaHero, type NextIntent, type Recommendation } from '@web/patterns/widgets';
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
  const heroTitle =
    p.summary?.replace(/^[·\s]+/, '').trim()
    || `Ongoing ${p.topic.replace(/^Your /i, '').toLowerCase()} and questions about your health`;

  return (
    <>
      <HomeMediaHero titleId="continue-deborah" title={heroTitle} eyebrow="Continue with the Oracle"
        tone="hero" artifact="violet-bloom" ctaLabel="Continue" onCta={p.onContinue} />
      <HomeSections {...p} journey={p.intakeCard && !p.intakeCard.complete ? undefined : p.journey} />
    </>
  );
}
