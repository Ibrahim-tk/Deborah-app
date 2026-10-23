/**
 * @pattern FullChoicePills — full-width stacked frosted options for intake forms
 *          (periods yes/no, HRT). One option per row.
 *          Sex at birth / pronouns / gender identity use FullChoicePillsGrid (2-col).
 *          Optional `describeValue`: that option morphs in-place into PillDescribeField
 *          (text + ChipPicker-style circular check) — no step remount.
 * @usedBy  Health Basics (yesNo / rows / describe pills); WidgetLab — not for in-chat answers
 * OPEN: DESIGN.md bans pills; used here by design direction 2026-10-14.
 */
import { type CSSProperties, type ReactNode } from 'react';
import { PillDescribeField } from '../PillDescribeField';
import { Icon } from '@web/ui';
import styles from './FullChoicePills.module.css';

export interface FullChoiceOption {
  id: string;
  label: string;
}

export interface FullChoicePillsProps {
  label: string;
  options: FullChoiceOption[];
  /** Controlled selected option id. */
  selected?: string;
  onPick: (id: string) => void;
  disabled?: boolean;
  /** Rendered after the last option (e.g. circular confirm tick for multi). */
  endSlot?: ReactNode;
  /**
   * When this option id is selected, that row morphs into PillDescribeField.
   * Field stays hidden until the option is tapped (selected === describeValue).
   */
  describeValue?: string;
  describeLabel?: string;
  describePlaceholder?: string;
  describeText?: string;
  onDescribeChange?: (text: string) => void;
  /** Circular check / Enter — confirm the describe answer and continue. */
  onDescribeConfirm?: () => void;
  /**
   * FullChoicePillsGrid only: describe option spans both columns before selection
   * (relationship “Someone else”). Ignored by stacked FullChoicePills.
   */
  describeAlwaysSpan?: boolean;
}

export function FullChoicePills({
  label,
  options,
  selected,
  onPick,
  disabled,
  endSlot,
  describeValue,
  describeLabel = 'Describe',
  describePlaceholder = 'describe your situation',
  describeText = '',
  onDescribeChange,
  onDescribeConfirm,
}: FullChoicePillsProps) {
  const dense = options.length > 4;
  const describing = Boolean(describeValue && selected === describeValue);

  return (
    <div
      className={styles.root}
      data-dense={dense || undefined}
      role="radiogroup"
      aria-label={label}
      data-full-choice-pills
    >
      {options.map((o, i) => {
        const isDescribe = describeValue !== undefined && o.id === describeValue;
        const showField = describing && isDescribe;

        return (
          <div
            key={o.id}
            className={styles.slot}
            style={{ '--i': i } as CSSProperties}
            data-describing={showField || undefined}
          >
            {showField ? (
              <PillDescribeField
                label={describeLabel}
                placeholder={describePlaceholder}
                value={describeText}
                disabled={disabled}
                onChange={(text) => onDescribeChange?.(text)}
                onConfirm={() => onDescribeConfirm?.()}
              />
            ) : (
              <button
                type="button"
                role="radio"
                data-choice-id={o.id}
                aria-checked={selected === o.id}
                className={styles.option}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) onPick(o.id);
                }}
              >
                <span className={styles.label}>{o.label}</span>
                <span className={styles.check} aria-hidden>{selected === o.id && <Icon name="check" size={14} strokeWidth={2.5} />}</span>
              </button>
            )}
          </div>
        );
      })}
      {endSlot}
    </div>
  );
}
