/**
 * Shared choice widget for V2 chat, /wid, and Health Basics. Emits stable IDs, never display labels.
 * `pills="inline"` (default) → compact InlineChoicePills for chat.
 * `pills="regular"` → full-size ChoicePills for intake forms.
 */
import { useRef, useState, type CSSProperties } from 'react';
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
  /** Chat checklist: shown as "Skip" until something is picked, then it becomes Submit (designer, 2026-10-28). */
  onSkip?: () => void;
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
  onSkip,
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

  // Chat only. More than three options: naked checkbox rows + a small Submit; the widget stays in the
  // thread (locked, showing what was picked) once sent.
  if (!regular && options.length > 3) {
    const pick = (id: string) => {
      if (locked) return;
      if (id === 'other' && onOther) return onOther();
      // Tapping the picked option again clears it (designer, 2026-10-28), so Skip comes back.
      setSelected(multi ? toggleSelection(selected, id, exclusive) : selected.includes(id) ? [] : [id]);
    };
    return (
      <div className={styles.root} role="group" aria-label={label} data-question-choices data-checklist>
        <div className={styles.checklist}>
          {options.map((o, i) => {
            const on = values.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                role={multi ? 'checkbox' : 'radio'}
                aria-checked={on}
                className={styles.checkRow}
                style={{ '--i': i } as CSSProperties}
                disabled={locked}
                onClick={() => pick(o.id)}
              >
                <span className={styles.checkBox} data-on={on || undefined} aria-hidden>
                  {on && <Icon name="check" size={12} strokeWidth={2.5} />}
                </span>
                {o.label}
              </button>
            );
          })}
        </div>
        {/* One button that changes in place (designer, 2026-10-28): Skip while nothing is picked, Submit once
            something is. Same element, so it never fades out and back in. Without a skip handler it's always Submit. */}
        {!locked && (onSkip || selected.length > 0) && (
          <Button
            size="md"
            variant={selected.length ? 'primary' : 'secondary'}
            className={styles.submit}
            style={{ '--n': options.length } as CSSProperties}
            onClick={() => {
              if (selected.length) return submit(selected);
              if (submitted.current || !onSkip) return;
              submitted.current = true;
              setSent(true);
              onSkip();
            }}
          >
            {selected.length ? 'Submit' : 'Skip'}
          </Button>
        )}
      </div>
    );
  }

  // Chat chips (three or fewer): gone once answered — the user's own bubble carries the answer.
  if (!regular && (sent || answered)) return null;

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
