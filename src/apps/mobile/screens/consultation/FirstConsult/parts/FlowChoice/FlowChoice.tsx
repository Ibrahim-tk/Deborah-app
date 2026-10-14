/**
 * A scripted question's answers as option rows. Yes/no questions instead get small pills, the same as
 * the onboarding health questions (design direction 2026-10-14; OPEN: DESIGN.md bans pills). Single choice answers on tap;
 * multi choice toggles pills (with a line check) and confirms, with an exclusive "None of these". Optional Skip and early exit.
 */
import { useState } from 'react';
import type { FlowOption } from '@shared/types/flow';
import { Button, OptionList, OptionRow } from '@mobile/ui';
import { ChoicePills } from '@mobile/patterns/widgets';
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

/** Short answers (up to 6, each a few words) show as compact pills; long ones keep full rows. */
const isShort = (options: FlowOption[]) => options.length <= 6 && options.every((o) => o.label.length <= 32);

export function FlowChoice({ label, options, multi, exclusive, step, onPick, onSkip, earlyExit }: FlowChoiceProps) {
  const [on, setOn] = useState<string[]>([]);
  const key = (o: FlowOption) => String(o.value ?? o.label);
  const toggle = (o: FlowOption) => {
    const k = key(o);
    if (k === exclusive) return setOn(on.includes(k) ? [] : [k]);
    setOn((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs.filter((x) => x !== exclusive), k]));
  };

  return (
    <div className={styles.root}>
      {step && <p className={styles.step}>Question {step}</p>}
      {multi ? (
        <ChoicePills label={label} options={options.map((o) => o.label)} onPick={() => {}} selected={options.filter((o) => on.includes(key(o))).map((o) => o.label)} onToggle={(l) => toggle(options.find((o) => o.label === l)!)} />
      ) : isShort(options) ? (
        <ChoicePills label={label} options={options.map((o) => o.label)} onPick={(_, i) => onPick([options[i]])} />
      ) : (
        <OptionList label={label}>
          {options.map((o) => (
            <OptionRow key={key(o)} multi={multi} selected={multi ? on.includes(key(o)) : undefined} onSelect={() => (multi ? toggle(o) : onPick([o]))}>
              {o.label}
            </OptionRow>
          ))}
        </OptionList>
      )}
      {multi && <Button fullWidth disabled={!on.length} onClick={() => onPick(options.filter((o) => on.includes(key(o))))}>Continue</Button>}
      {(onSkip || earlyExit) && (
        <div className={styles.links}>
          {onSkip && <Button variant="ghost" onClick={onSkip}>Skip</Button>}
          {earlyExit && <Button variant="ghost" onClick={earlyExit.onPress}>{earlyExit.label}</Button>}
        </div>
      )}
    </div>
  );
}
