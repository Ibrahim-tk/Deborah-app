/**
 * Per-question answer widget chosen by design (F02f `widget` on the question). Choice questions use the same
 * QuestionChoices as the first consultation (M-2.12 FlowChoice, design 2026-10-21): single choice answers on
 * tap; multi choice holds the picks in the composer (HeldChoice) and is sent from there — no tick. Mood keeps
 * its scale. Engine ids in, engine ids out — copy stays in the engine.
 */
import type { IntakeMeta } from '@shared/types/domain';
import { MoodScale, QuestionChoices } from '@web/patterns/widgets';
import { useHeldChoice } from '../HeldChoice';

export interface WidgetAnswerProps {
  intake: IntakeMeta;
  locked: boolean;
  /** Submit option ids to the engine. */
  onFinish: (ids: string[]) => void;
  /** "Other" → type the answer in the composer. */
  onOther: () => void;
  /** Checklist questions: Skip until something is picked (designer, 2026-10-28). */
  onSkip?: () => void;
}

export function WidgetAnswer({ intake, locked, onFinish, onOther, onSkip }: WidgetAnswerProps) {
  const { held, setHeld } = useHeldChoice();
  const options = intake.options.map((o) => ({ id: o.id, label: o.label }));
  const ids = options.map((o) => o.id);
  const answered = intake.answered;
  const labelOf = (id: string) => options.find((o) => o.id === id)?.label ?? id;
  const key = intake.questionId;

  if (intake.widget === 'mood') {
    if (answered) return null; // the answer bubble already shows the pick
    return <MoodScale title="Mood" onPick={(_label, i) => !locked && ids[i] && onFinish([ids[i]])} />;
  }

  if (intake.widget === 'inlineMulti') {
    return (
      <QuestionChoices
        label="Pick all that apply"
        options={options}
        multi
        exclusive={ids.find((id) => id === 'none')}
        disabled={locked}
        answered={answered}
        confirm="none"
        value={held?.key === key ? held.ids : []}
        onChange={(next) => setHeld(next.length ? { key, ids: next, labels: next.map(labelOf), finish: onFinish } : null)}
        onOther={onOther}
        onSkip={onSkip}
        onSubmit={(next) => { setHeld(null); onFinish(next); }}
      />
    );
  }

  return (
    <QuestionChoices
      label="Answer options"
      options={options}
      disabled={locked}
      answered={answered}
      onSkip={onSkip}
      onSubmit={(next) => (next[0] === 'other' ? onOther() : onFinish(next))}
    />
  );
}
