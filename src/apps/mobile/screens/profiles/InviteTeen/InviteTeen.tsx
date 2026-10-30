/**
 * @screen  M-6.7 · Invite your teen
 * @flow    F06 Family profiles · teen with their own account (FigJam teen-account board)
 * @presentation sheet from Family profiles (M-6.6) and the profile switcher (M-6.1); Family Plan only
 * @states  privacy disclaimer · teen's email · invitation sent
 * @figma   —
 * @spec    FigJam "Teen with their own account" (OPEN: add to docs/ux/F06-family-profiles.md)
 * @xref    web: W-6.7 (apps/web/screens/profiles/InviteTeen)
 *
 * The teen gets a private login linked to the Family Plan (simulated email, M-1.12).
 * The parent never sees the teen's conversations or health information.
 */
import { useState, type FormEvent } from 'react';
import { teenAccountCopy as copy } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Button, Input, Sheet } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './InviteTeen.module.css';

const VALID = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Step = 'privacy' | 'email' | 'sent';

export default function InviteTeen() {
  const { dismissSheet } = useNav();
  const [step, setStep] = useState<Step>('privacy');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const ok = VALID.test(email.trim());

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!ok) return setError(copy.errors.email);
    useAppStore.getState().inviteTeen(email.trim());
    setStep('sent');
  };

  const title = step === 'privacy' ? copy.disclaimer.title : step === 'email' ? copy.invite.title : copy.sent.title;
  return (
    <div data-xref="M-6.7 · Invite your teen">
      <Sheet title={title}>
        {step === 'privacy' && (
          <div key="privacy" className={styles.stage} data-placeholder>
            {copy.disclaimer.body.map((t) => <p key={t} className={styles.text}>{t}</p>)}
            <Button fullWidth onClick={() => setStep('email')}>{copy.disclaimer.cta}</Button>
          </div>
        )}
        {step === 'email' && (
          <form key="email" className={styles.stage} onSubmit={send} noValidate data-placeholder>
            <p className={styles.text}>{copy.invite.intro}</p>
            <Input label="Teen’s email address" type="email" inputMode="email" autoComplete="off" placeholder="name@example.com" value={email} error={error} onChange={(e) => { setEmail(e.target.value); setError(undefined); }} />
            <p className={styles.small}>{copy.invite.after}</p>
            <Button type="submit" fullWidth disabled={!email.trim()}>{copy.invite.cta}</Button>
          </form>
        )}
        {step === 'sent' && (
          <div key="sent" className={styles.stage} role="status" data-placeholder>
            <p className={styles.text}>{copy.sent.body.replace('{email}', email.trim())}</p>
            <Button fullWidth onClick={dismissSheet}>Done</Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
