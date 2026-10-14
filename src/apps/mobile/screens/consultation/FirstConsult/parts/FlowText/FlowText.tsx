/** A scripted question that wants her own words: one field and a send button, inline under Deborah's message. */
import { useState, type FormEvent } from 'react';
import { Icon, Input } from '@mobile/ui';
import styles from './FlowText.module.css';

export interface FlowTextProps {
  label: string;
  placeholder?: string;
  step?: string;
  onSend: (text: string) => void;
  onSkip?: () => void;
}

export function FlowText({ label, placeholder, step, onSend, onSkip }: FlowTextProps) {
  const [text, setText] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) onSend(text.trim());
  };
  return (
    <form className={styles.root} onSubmit={submit} noValidate>
      {step && <p className={styles.step}>Question {step}</p>}
      <div className={styles.row}>
        <Input className={styles.field} label={label} hideLabel value={text} placeholder={placeholder} autoFocus enterKeyHint="send" onChange={(e) => setText(e.target.value)} />
        <button type="submit" className={styles.send} aria-label="Send" disabled={!text.trim()}>
          <Icon name="send" size={20} />
        </button>
      </div>
      {onSkip && <button type="button" className={styles.skip} onClick={onSkip}>Skip</button>}
    </form>
  );
}
