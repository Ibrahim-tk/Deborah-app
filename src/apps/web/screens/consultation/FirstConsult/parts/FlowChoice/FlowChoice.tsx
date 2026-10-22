/**
 * A scripted question's answers as option rows. Yes/no questions instead get small pills, the same as
 * the onboarding health questions (design direction 2026-10-14; OPEN: DESIGN.md bans pills). Single choice answers on tap;
 * multi choice toggles pills (with a line check) and confirms, with an exclusive "None of these". Optional Skip and early exit.
 */
import { useState } from 'react';
import type { FlowOption } from '@shared/types/flow';
import { Button, Icon } from '@web/ui';
import { QuestionChoices } from '@web/patterns/widgets';
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
  /** Multi: selection lives in the composer as pills and is sent from there (no tick). */
  selected?: FlowOption[];
  onSelect?: (picked: FlowOption[]) => void;
}

export function FlowChoice({ label, options, multi, exclusive, step, onPick, onSkip, earlyExit, selected, onSelect }: FlowChoiceProps) {
  // Index IDs preserve even duplicate labels and each original value/next transition.
  const exclusiveIndex = options.findIndex((o) => String(o.value ?? o.label) === exclusive);
  const [copied, setCopied] = useState(false);
  // Copy Deborah's message (designer, 2026-10-21): icon sits on the same row as the answer chips.
  const copy = async () => {
    try { await navigator.clipboard.writeText(label); } catch { /* clipboard blocked: still confirm visually */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={styles.root}>
      {step && <p className={styles.step}>Question {step}</p>}
      <div className={styles.actions}>
        <div className={styles.choices}>
          <QuestionChoices label={label} options={options.map((o, i) => ({ id: String(i), label: o.label }))} multi={multi} exclusive={exclusiveIndex < 0 ? undefined : String(exclusiveIndex)} onSubmit={(ids) => onPick(ids.map((id) => options[Number(id)]))}
            {...(multi && onSelect ? { confirm: 'none' as const, value: (selected ?? []).map((o) => String(options.indexOf(o))), onChange: (ids: string[]) => onSelect(ids.map((id) => options[Number(id)])) } : {})} />
        </div>
        <button type="button" className={styles.copy} onClick={copy} aria-label={copied ? 'Copied' : 'Copy message'} title={copied ? 'Copied' : 'Copy'}>
          <Icon name={copied ? 'check' : 'copy'} size={18} />
        </button>
      </div>
      {(onSkip || earlyExit) && <div className={styles.links}>
        {onSkip && <Button variant="ghost" onClick={onSkip}>Skip</Button>}
        {earlyExit && <Button variant="ghost" onClick={earlyExit.onPress}>{earlyExit.label}</Button>}
      </div>}
    </div>
  );
}
