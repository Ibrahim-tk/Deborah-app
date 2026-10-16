/**
 * Home · State 1 — new user who skipped the chat (Figma 170:145).
 * AI-native overhaul: PrimaryIntentCard + PromptStarterList; logic unchanged.
 */
import { Button, Icon, IconWell, ProgressRing } from '@mobile/ui';
import {
  HealingPlanCard,
  IntakeCompletionCard,
  PrimaryIntentCard,
  PromptStarterList,
} from '@mobile/patterns/widgets';
import styles from './HomeStates.module.css';

const PROMPTS = [
  { label: 'I’ve been feeling tired', prefill: 'I’ve been feeling tired all the time.' },
  { label: 'Help me with sleep', prefill: 'Can you help me with my sleep?' },
  { label: 'Review my supplements', prefill: 'Can you review the supplements I take?' },
];

export interface StateNewProps {
  onPrompt: (prefill: string) => void;
  profile?: { progress: number; onOpen: () => void };
  intakeCard?: { progress: number; complete: boolean; onAction: () => void };
  onAddFamily: () => void;
}

export function StateNew({ onPrompt, profile, intakeCard, onAddFamily }: StateNewProps) {
  return (
    <>
      {profile && (
        <PrimaryIntentCard
          titleId="complete-profile"
          title="Complete your health profile"
          body="A few quick questions so Deborah’s guidance fits you. About 2 minutes."
          leading={<ProgressRing value={profile.progress} size={52} label="Health profile complete" />}
        >
          <Button fullWidth onClick={profile.onOpen}>Complete your health profile</Button>
        </PrimaryIntentCard>
      )}
      {intakeCard && (
        <IntakeCompletionCard progress={intakeCard.progress} complete={intakeCard.complete} onAction={intakeCard.onAction} />
      )}

      <PrimaryIntentCard
        tone={profile ? 'lift' : 'lilac'}
        titleId="start-deborah"
        title="Start with Deborah"
        body="Tell her what’s going on. She’ll ask a few questions, then share what she thinks."
      >
        <PromptStarterList items={PROMPTS} onPrompt={onPrompt} variant={profile ? 'onLift' : 'paper'} />
      </PrimaryIntentCard>

      <HealingPlanCard locked />

      <button type="button" className={styles.familyRow} onClick={onAddFamily}>
        <IconWell icon="plus" well="sm" tint="rose" />
        <span className={styles.familyText}>Add a family member</span>
        <Icon name="chevron" size={18} />
      </button>
    </>
  );
}
