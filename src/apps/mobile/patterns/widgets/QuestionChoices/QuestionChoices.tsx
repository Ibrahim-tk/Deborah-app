/**
 * Shared choice widget for V2 chat and /wid. Emits stable IDs, never display labels.
 * IntakeQuestion, FlowChoice, and WidgetLab all mount this — edit once for both surfaces.
 */
import { useRef, useState } from 'react';
import type { Option } from '@shared/types/domain';
import { Button, Icon, OptionList, OptionRow } from '@mobile/ui';
import { ChoicePills } from '../ChoicePills';
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
  /**
   * Multi confirm control: full-width Continue bar (default), or circular tick after the last pill.
   * F02d expand lists use `tick`.
   */
  confirm?: 'bar' | 'tick';
  /** When the `other` option is tapped in multi mode, call this instead of toggling it on. */
  onOther?: () => void;
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
  confirm = 'bar',
  onOther,
}: QuestionChoicesProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const submitted = useRef(false);
  const [sent, setSent] = useState(false);
  const locked = disabled || sent || Boolean(answered);
  const values = answered ?? selected;
  // Tick confirm always uses small pills (expand lists often have 9+ options — the old ≤8
  // cutoff was flipping them to full-width rows).
  const compact =
    confirm === 'tick' || (options.length <= 12 && options.every((o) => o.label.length <= 56));
  const submit = (ids: string[]) => {
    if (locked || submitted.current || !ids.length) return;
    submitted.current = true;
    setSelected(ids);
    setSent(true);
    onSubmit(ids);
  };

  const toggle = (id: string) => {
    if (id === 'other' && onOther) {
      onOther();
      return;
    }
    setSelected((xs) => toggleSelection(xs, id, exclusive));
  };

  const canConfirm = multi && !locked && selected.length > 0 && !selected.includes('other');
  const tick = canConfirm && confirm === 'tick' && (
    <button
      type="button"
      className={styles.tick}
      aria-label="Continue"
      onClick={() => submit(selected)}
    >
      <Icon name="check" size={22} />
    </button>
  );

  return (
    <div className={styles.root} role="group" aria-label={label} data-question-choices data-multi={multi || undefined}>
      {compact ? (
        <ChoicePills
          label={label}
          options={options.map((o) => o.label)}
          optionIds={options.map((o) => o.id)}
          selected={options.filter((o) => values.includes(o.id)).map((o) => o.label)}
          disabled={locked}
          onPick={(_, i) => submit([options[i].id])}
          onToggle={multi ? (_, i) => toggle(options[i].id) : undefined}
          endSlot={tick}
        />
      ) : (
        <OptionList label={label} multi={multi}>
          {options.map((o) => (
            <OptionRow
              key={o.id}
              choiceId={o.id}
              multi={multi}
              selected={values.includes(o.id)}
              disabled={locked}
              onSelect={() => (multi ? toggle(o.id) : submit([o.id]))}
            >
              {o.label}
            </OptionRow>
          ))}
        </OptionList>
      )}
      {multi && !locked && confirm === 'bar' && canConfirm && (
        <Button fullWidth className={styles.continueBar} disabled={!selected.length} onClick={() => submit(selected)}>
          Continue
        </Button>
      )}
      {!compact && tick}
    </div>
  );
}
