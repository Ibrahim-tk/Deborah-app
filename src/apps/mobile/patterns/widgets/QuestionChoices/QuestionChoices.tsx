/**
 * Shared choice widget for V2 chat, /wid, and Health Basics. Emits stable IDs, never display labels.
 * `pills="inline"` (default) → compact InlineChoicePills for chat.
 * `pills="regular"` → full-size ChoicePills for intake forms.
 */
import { useRef, useState } from 'react';
import type { Option } from '@shared/types/domain';
import { Button, Icon, OptionList, OptionRow } from '@mobile/ui';
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
  /**
   * Multi confirm control: circular tick after the last pill (default), or full-width Continue bar.
   */
  confirm?: 'bar' | 'tick' | 'none';
  /** Controlled selection (multi). With `confirm="none"` the host sends it (e.g. from the composer). */
  value?: string[];
  onChange?: (ids: string[]) => void;
  /** When the `other` option is tapped in multi mode, call this instead of toggling it on. */
  onOther?: () => void;
  /**
   * Pill size: `inline` (default) for chat /wid; `regular` for Health Basics intake forms.
   */
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
  onOther,
  pills = 'inline',
  value,
  onChange,
}: QuestionChoicesProps) {
  const [own, setOwn] = useState<string[]>(initialSelected);
  const selected = value ?? own;
  const setSelected = (ids: string[]) => { setOwn(ids); onChange?.(ids); };
  const submitted = useRef(false);
  const [sent, setSent] = useState(false);
  const locked = disabled || sent || Boolean(answered);
  const values = answered ?? selected;
  const regular = pills === 'regular';
  // Tick confirm always uses pills (expand lists often have 9+ options — the old ≤8
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
    // Without a confirm control, the exclusive answer ("None of these") is sent straight away.
    if (confirm === 'none' && id === exclusive && !selected.includes(id)) return submit([id]);
    setSelected(toggleSelection(selected, id, exclusive));
  };

  const canConfirm = multi && !locked && selected.length > 0 && !selected.includes('other');
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
    onToggle: multi ? (_: string, i: number) => toggle(options[i].id) : undefined,
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
