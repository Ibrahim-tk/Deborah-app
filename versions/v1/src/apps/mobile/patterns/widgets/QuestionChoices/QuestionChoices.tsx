/** Shared /wid + intake choice widget. Emits stable IDs, never display labels. */
import { useRef, useState } from 'react';
import type { Option } from '@flow-v1/shared/types/domain';
import { Button, Icon, OptionList, OptionRow } from '@flow-v1/apps/mobile/ui';
import { ChoicePills } from '../ChoicePills';
import { InlineChoicePills } from '../InlineChoicePills';
import { toggleSelection } from './selection';
import styles from './QuestionChoices.module.css';

export interface QuestionChoicesProps {
  label: string;
  options: Option[];
  multi?: boolean;
  exclusive?: string;
  disabled?: boolean;
  answered?: string[];
  initialSelected?: string[];
  onSubmit: (ids: string[]) => void;
  /** Multi confirm: circular tick after last pill (default), or full-width Continue bar. */
  confirm?: 'bar' | 'tick';
  /** `inline` (default) for chat /wid; `regular` for intake forms. */
  pills?: 'inline' | 'regular';
}

export function QuestionChoices({
  label,
  options,
  multi,
  exclusive,
  disabled,
  answered,
  initialSelected = [],
  onSubmit,
  confirm = 'tick',
  pills = 'inline',
}: QuestionChoicesProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const submitted = useRef(false);
  const [sent, setSent] = useState(false);
  const locked = disabled || sent || Boolean(answered);
  const values = answered ?? selected;
  const regular = pills === 'regular';
  const compact =
    confirm === 'tick' || (options.length <= 8 && options.every((o) => o.label.length <= 56));
  const submit = (ids: string[]) => {
    if (locked || submitted.current || !ids.length) return;
    submitted.current = true;
    setSelected(ids);
    setSent(true);
    onSubmit(ids);
  };

  const canConfirm = multi && !locked && selected.length > 0;
  const tick = canConfirm && confirm === 'tick' && (
    <button
      type="button"
      className={regular ? styles.tickRegular : styles.tick}
      aria-label="Continue"
      onClick={() => submit(selected)}
    >
      <Icon name="check" size={regular ? 22 : 18} />
    </button>
  );

  const pillProps = {
    label,
    options: options.map((o) => o.label),
    optionIds: options.map((o) => o.id),
    selected: options.filter((o) => values.includes(o.id)).map((o) => o.label),
    disabled: locked,
    onPick: (_: string, i: number) => submit([options[i].id]),
    onToggle: multi ? (_: string, i: number) => setSelected((xs) => toggleSelection(xs, options[i].id, exclusive)) : undefined,
    endSlot: tick,
  };

  return (
    <div
      className={styles.root}
      role="group"
      aria-label={label}
      data-question-choices
      data-multi={multi || undefined}
      data-pills={pills}
    >
      {compact ? (
        regular ? <ChoicePills {...pillProps} /> : <InlineChoicePills {...pillProps} />
      ) : (
        <OptionList label={label} multi={multi}>
          {options.map((o) => (
            <OptionRow
              key={o.id}
              choiceId={o.id}
              multi={multi}
              selected={values.includes(o.id)}
              disabled={locked}
              onSelect={() => (multi ? setSelected((xs) => toggleSelection(xs, o.id, exclusive)) : submit([o.id]))}
            >
              {o.label}
            </OptionRow>
          ))}
        </OptionList>
      )}
      {multi && !locked && confirm === 'bar' && canConfirm && (
        <Button fullWidth disabled={!selected.length} onClick={() => submit(selected)}>Continue</Button>
      )}
      {!compact && tick}
    </div>
  );
}
