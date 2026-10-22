/**
 * @pattern FullChoicePillsGrid — two-column full-width frosted options for
 *          sex at birth / pronouns / gender identity / relationship. Same pill look as FullChoicePills.
 *          `describeValue` (Other / Someone else) sits in the 2-col grid until selected
 *          (or always spans with `describeAlwaysSpan`), then morphs into PillDescribeField.
 *          Prefer not to say always stays in the grid.
 * @usedBy  Health Basics (sex, pronouns, gender, otherPuberty); WidgetLab / DesignSystem specimens
 * OPEN: DESIGN.md bans pills; used here by design direction 2026-10-14.
 */
import { type CSSProperties } from 'react';
import { PillDescribeField } from '../PillDescribeField';
import type { FullChoiceOption, FullChoicePillsProps } from '../FullChoicePills/FullChoicePills';
import styles from './FullChoicePillsGrid.module.css';

export type { FullChoiceOption };

export type FullChoicePillsGridProps = FullChoicePillsProps;

export function FullChoicePillsGrid({
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
  describeAlwaysSpan,
}: FullChoicePillsGridProps) {
  const dense = options.length > 4;
  const describing = Boolean(describeValue && selected === describeValue);

  return (
    <div
      className={styles.root}
      data-dense={dense || undefined}
      role="radiogroup"
      aria-label={label}
      data-full-choice-pills-grid
    >
      <div className={styles.grid}>
        {options.map((o, i) => {
          const isDescribe = describeValue !== undefined && o.id === describeValue;
          const showField = describing && isDescribe;
          const span = showField || (isDescribe && describeAlwaysSpan);

          return (
            <div
              key={o.id}
              className={styles.slot}
              style={{ '--i': i } as CSSProperties}
              data-describing={showField || undefined}
              data-span={span || undefined}
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
                </button>
              )}
            </div>
          );
        })}
      </div>
      {endSlot}
    </div>
  );
}
