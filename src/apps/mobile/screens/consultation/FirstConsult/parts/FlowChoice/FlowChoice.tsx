/**
 * A scripted question's answers as option rows (DESIGN.md: rows, not pills). Single choice answers on tap;
 * multi choice ticks rows and confirms, with an exclusive "None of these". Optional Skip and early exit.
 */
import { useState } from 'react';
import type { FlowOption } from '@shared/types/flow';
import { Button, OptionList, OptionRow } from '@mobile/ui';
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
      <OptionList label={label}>
        {options.map((o) => (
          <OptionRow key={key(o)} multi={multi} selected={multi ? on.includes(key(o)) : undefined} onSelect={() => (multi ? toggle(o) : onPick([o]))}>
            {o.label}
          </OptionRow>
        ))}
      </OptionList>
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
