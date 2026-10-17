/**
 * Home · State 1 — new user. Artifact hero + compact composer-style suggestions.
 */
import { Icon, IconWell } from '@mobile/ui';
import { SuggestionList } from '@mobile/patterns/chat';
import {
  GlassCareStrip,
  HomeMediaHero,
  IntakeCompletionCard,
  PhotoDestinationPair,
} from '@mobile/patterns/widgets';
import type { Suggestion } from '@shared/types/content';
import styles from './HomeStates.module.css';

const PROMPTS = [
  {
    key: 'tired',
    label: 'I’ve been feeling tired',
    prefill: 'I’ve been feeling tired all the time.',
  },
  {
    key: 'sleep',
    label: 'Help me with sleep',
    prefill: 'Can you help me with my sleep?',
  },
  {
    key: 'supplements',
    label: 'Review my supplements',
    prefill: 'Can you review the supplements I take?',
  },
];

const SUGGESTIONS: Suggestion[] = PROMPTS.map((p) => ({
  id: p.key,
  text: p.label,
  scriptId: '',
}));

export interface StateNewProps {
  onPrompt: (prefill: string) => void;
  /** Opens chat with Deborah (hero frosted chevron). */
  onStart: () => void;
  profile?: { progress: number; onOpen: () => void };
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  onAddFamily: () => void;
  destinations: [{ title: string; meta: string; onPress: () => void }, { title: string; meta: string; onPress: () => void }];
}

export function StateNew({ onPrompt, onStart, profile, intakeCard, onAddFamily, destinations }: StateNewProps) {
  const care: { key: string; label: string; meta?: string; onPress: () => void }[] = [];
  if (profile) {
    care.push({
      key: 'profile',
      label: 'Health profile',
      meta: `${Math.round(profile.progress * 100)}%`,
      onPress: profile.onOpen,
    });
  }

  const selectSuggestion = (s: Suggestion) => {
    const match = PROMPTS.find((p) => p.key === s.id);
    onPrompt(match?.prefill ?? s.text);
  };

  return (
    <>
      {profile ? (
        <HomeMediaHero
          titleId="complete-profile"
          title="Complete your health profile"
          meta="A few quick questions so Deborah’s guidance fits you. About 2 minutes."
          tone="rose"
          artifact="botanical"
          ctaLabel="Complete your health profile"
          onCta={profile.onOpen}
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

      <section className={styles.suggestSection} aria-label={profile ? 'Or ask about' : 'Start with'}>
        <h2 className={styles.suggestLabel}>{profile ? 'Or ask about' : 'Start with'}</h2>
        <SuggestionList suggestions={SUGGESTIONS} onSelect={selectSuggestion} compact />
      </section>

      <GlassCareStrip items={care} />

      {intakeCard && (
        <IntakeCompletionCard
          progress={intakeCard.progress}
          complete={intakeCard.complete}
          onAction={intakeCard.onAction}
        />
      )}

      <PhotoDestinationPair
        tiles={[
          {
            title: destinations[0].title,
            meta: destinations[0].meta,
            tone: 'mint',
            artifact: 'dest-health-art',
            action: 'chevron',
            onPress: destinations[0].onPress,
          },
          {
            title: destinations[1].title,
            meta: destinations[1].meta,
            tone: 'rose',
            artifact: 'dest-family-art',
            action: 'plus',
            onPress: destinations[1].onPress,
          },
        ]}
      />

      <button type="button" className={styles.familyRow} onClick={onAddFamily}>
        <IconWell icon="plus" well="sm" tint="rose" />
        <span className={styles.familyText}>Add a family member</span>
        <Icon name="chevron" size={18} />
      </button>
    </>
  );
}
