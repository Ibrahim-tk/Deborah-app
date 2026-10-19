/**
 * Per-question answer widget chosen by design (F02f `widget` on the question): inline pills (single or
 * multi with a tick to confirm) or the mood scale. Engine ids in, engine ids out — copy stays in the engine.
 */
import { useState } from 'react';
import type { IntakeMeta } from '@shared/types/domain';
import { IconButton } from '@mobile/ui';
import { InlineChoicePills, MoodScale } from '@mobile/patterns/widgets';

export interface WidgetAnswerProps {
  intake: IntakeMeta;
  locked: boolean;
  /** Submit option ids to the engine. */
  onFinish: (ids: string[]) => void;
  /** "Other" → type the answer in the composer. */
  onOther: () => void;
}

export function WidgetAnswer({ intake, locked, onFinish, onOther }: WidgetAnswerProps) {
  const [chosen, setChosen] = useState<string[]>([]);
  const ids = intake.options.map((o) => o.id);
  const labels = intake.options.map((o) => o.label);
  const answered = intake.answered;
  const labelOf = (id: string) => intake.options.find((o) => o.id === id)?.label ?? id;

  if (intake.widget === 'mood') {
    if (answered) return null; // the answer bubble already shows the pick
    return <MoodScale title="Mood" onPick={(_label, i) => !locked && ids[i] && onFinish([ids[i]])} />;
  }

  const pick = (_label: string, i: number) => {
    if (locked) return;
    const id = ids[i];
    if (id === 'other') return onOther();
    onFinish([id]);
  };

  if (intake.widget === 'inlineMulti') {
    const toggle = (_label: string, i: number) => {
      if (locked) return;
      const id = ids[i];
      setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    };
    const shown = (answered ?? chosen).map(labelOf);
    return (
      <InlineChoicePills
        label="Pick all that apply"
        options={labels}
        optionIds={ids}
        selected={shown}
        disabled={locked}
        onPick={toggle}
        onToggle={toggle}
        endSlot={
          !locked && chosen.length > 0 ? (
            <IconButton icon="check" size="sm" tone="accent" label="Done" onClick={() => onFinish(chosen)} />
          ) : null
        }
      />
    );
  }

  return (
    <InlineChoicePills
      label="Answer options"
      options={labels}
      optionIds={ids}
      keepAnswer
      selected={answered?.map(labelOf)}
      disabled={locked}
      onPick={pick}
    />
  );
}
