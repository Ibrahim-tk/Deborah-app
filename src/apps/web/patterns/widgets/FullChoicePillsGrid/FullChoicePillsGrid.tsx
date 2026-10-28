/**
 * @pattern FullChoicePillsGrid — two-column full-width frosted options for
 *          sex at birth / pronouns / gender identity / relationship. Same pill look as FullChoicePills.
 *          `describeValue` (Other / Someone else) sits in the 2-col grid until selected
 *          (or always spans with `describeAlwaysSpan`), then morphs into PillDescribeField.
 *          Prefer not to say always stays in the grid.
 * @usedBy  Health Basics (sex, pronouns, gender, otherPuberty); WidgetLab / DesignSystem specimens
 * OPEN: DESIGN.md bans pills; used here by design direction 2026-10-14.
 */
import { type CSSProperties, useLayoutEffect, useRef } from 'react';
import { PillDescribeField } from '../PillDescribeField';
import type { FullChoiceOption, FullChoicePillsProps } from '../FullChoicePills/FullChoicePills';
import { Icon } from '@web/ui';
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
  const morphRef = useRef<HTMLDivElement>(null);
  const lastRect = useRef<DOMRect | null>(null);

  // FLIP: glide the Other slot from its cell to the full-width row (and back) instead of jumping.
  useLayoutEffect(() => {
    const el = morphRef.current;
    const prev = lastRect.current;
    if (!el) return;
    if (prev && !describing) el.firstElementChild?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
    const next = el.getBoundingClientRect();
    lastRect.current = next;
    if (!prev || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (prev.width === next.width && prev.top === next.top && prev.left === next.left) return;
    el.style.transition = 'none';
    el.style.width = `${prev.width}px`;
    el.style.height = `${prev.height}px`;
    el.style.transform = `translate(${prev.left - next.left}px, ${prev.top - next.top}px)`;
    void el.offsetWidth;
    el.style.transition = 'transform 420ms var(--ease-out), width 420ms var(--ease-out), height 420ms var(--ease-out)';
    el.style.width = `${next.width}px`;
    el.style.height = `${next.height}px`;
    el.style.transform = '';
    const done = () => {
      el.style.transition = '';
      el.style.width = '';
      el.style.height = '';
      lastRect.current = el.getBoundingClientRect();
    };
    el.addEventListener('transitionend', done, { once: true });
    return () => el.removeEventListener('transitionend', done);
  }, [describing]);

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
              ref={isDescribe ? morphRef : undefined}
              className={styles.slot}
              style={{ '--i': i } as CSSProperties}
              data-describing={showField || undefined}
              data-span={span || undefined}
            >
              {showField ? (
                <div className={styles.morphIn}>
                <PillDescribeField
                  label={describeLabel}
                  placeholder={describePlaceholder}
                  value={describeText}
                  disabled={disabled}
                  onChange={(text) => onDescribeChange?.(text)}
                  onConfirm={() => onDescribeConfirm?.()}
                />
                </div>
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
      </div>
      {endSlot}
    </div>
  );
}
