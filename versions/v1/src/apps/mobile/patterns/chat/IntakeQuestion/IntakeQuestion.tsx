/**
 * @pattern IntakeQuestion — /wid widgets bound to existing engine question IDs and answer events.
 * Only the current question accepts input. Question copy, ordering and profile writes stay in the engine.
 * Specialized year/date/measurement fields remain unchanged; no current intake question is a 0–10 or
 * five-face mood question, so ScaleCheck and MoodScale are not substituted for categorical answers.
 */
import { useRef, useState } from 'react';
import type { IntakeMeta } from '@flow-v1/shared/types/domain';
import { Button, Input } from '@flow-v1/apps/mobile/ui';
import { InlineConsent, QuestionChoices } from '@flow-v1/apps/mobile/patterns/widgets';
import { IntakeFields } from './IntakeFields';
import styles from './IntakeQuestion.module.css';

export interface IntakeQuestionProps {
  intake: IntakeMeta;
  prompt?: string;
  layout?: 'list' | 'grid2';
  active: boolean;
  onAnswer: (optionIds: string[], otherText?: string) => void;
  onOther?: () => void;
  onSkip?: () => void;
}

export function IntakeQuestion({ intake, prompt, active, onAnswer }: IntakeQuestionProps) {
  const [otherOn, setOtherOn] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [sent, setSent] = useState(false);
  const submitting = useRef(false);
  const [otherIds, setOtherIds] = useState<string[]>([]);
  const locked = !active || sent;
  if (intake.skipped) return <p className={styles.step}>Skipped</p>;
  if (intake.input) return active ? <IntakeFields input={intake.input} onAnswer={onAnswer} /> : null;
  if (intake.questionId === 'health-consent') {
    return <InlineConsent title={prompt} description={null} agreeLabel={intake.options.find((o) => o.id === 'agree')?.label} declineLabel={intake.options.find((o) => o.id === 'decline')?.label} disabled={!active} answered={intake.answered ? (intake.answered.includes('agree') ? 'agreed' : 'declined') : undefined} onAgree={() => onAnswer(['agree'])} onDecline={() => onAnswer(['decline'])} />;
  }
  // Preserve the standard chat's existing Other-text escape hatch. Question data is untouched.
  const options = intake.options.some((o) => o.id === 'other') ? intake.options : [...intake.options, { id: 'other', label: 'Other…' }];
  const submit = (ids: string[]) => {
    if (locked) return;
    if (ids.includes('other')) { setOtherIds(ids); setOtherOn(true); return; }
    setSent(true);
    onAnswer(ids);
  };
  return (
    <div className={styles.root}>
      <QuestionChoices key={otherOn ? 'other' : 'choices'} label="Answer options" options={options} multi={intake.multi} exclusive="none" disabled={locked || otherOn} initialSelected={otherIds} answered={intake.answered ?? (otherOn ? otherIds : undefined)} onSubmit={submit} />
      {otherOn && active && <form className={styles.otherForm} onSubmit={(e) => {
        e.preventDefault();
        if (!otherText.trim() || submitting.current) return;
        submitting.current = true;
        setSent(true);
        onAnswer(otherIds.length ? otherIds : ['other'], otherText.trim());
      }}>
        <Input label="Other answer" value={otherText} autoFocus placeholder="Type your answer…" onChange={(e) => setOtherText(e.target.value)} />
        <Button type="submit" fullWidth disabled={!otherText.trim() || sent}>Send</Button>
        <Button variant="ghost" disabled={sent} onClick={() => setOtherOn(false)}>Back to options</Button>
      </form>}
    </div>
  );
}
