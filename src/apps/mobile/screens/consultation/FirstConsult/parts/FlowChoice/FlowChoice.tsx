/**
 * A scripted question's answers as option rows. Yes/no questions instead get small pills, the same as
 * the onboarding health questions (design direction 2026-10-14; OPEN: DESIGN.md bans pills). Single choice answers on tap;
 * multi choice toggles pills (with a line check) and confirms, with an exclusive "None of these". Optional Skip and early exit.
 */
import type { FlowOption } from '@shared/types/flow';
import { Button } from '@mobile/ui';
import { QuestionChoices } from '@mobile/patterns/widgets';
import styles from './FlowChoice.module.css';

export interface FlowChoiceProps {
  label: string;
  options: FlowOption[];
  multi?: boolean;
  exclusive?: string;
  step?: string;
  onPick: (picked: FlowOption[]) => void;
  onSkip?: () => void;
  earlyExit?: { label: string; onPress: () => void };
}

export function FlowChoice({ label, options, multi, exclusive, step, onPick, onSkip, earlyExit }: FlowChoiceProps) {
  // Index IDs preserve even duplicate labels and each original value/next transition.
  const exclusiveIndex = options.findIndex((o) => String(o.value ?? o.label) === exclusive);
  return (
    <div className={styles.root}>
      {step && <p className={styles.step}>Question {step}</p>}
      <QuestionChoices label={label} options={options.map((o, i) => ({ id: String(i), label: o.label }))} multi={multi} exclusive={exclusiveIndex < 0 ? undefined : String(exclusiveIndex)} onSubmit={(ids) => onPick(ids.map((id) => options[Number(id)]))} />
      {(onSkip || earlyExit) && <div className={styles.links}>
        {onSkip && <Button variant="ghost" onClick={onSkip}>Skip</Button>}
        {earlyExit && <Button variant="ghost" onClick={earlyExit.onPress}>{earlyExit.label}</Button>}
      </div>}
    </div>
  );
}
