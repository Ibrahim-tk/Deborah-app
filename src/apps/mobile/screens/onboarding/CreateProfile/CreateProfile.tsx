/**
 * @screen  M-1.4 · Create your profile
 * @flow    F01 First launch & onboarding (design direction 2026-10-13 rev 5)
 * @presentation sheet over Welcome (M-1.2), which already asked for the first name
 * @states  form (email + password) · field error · code · you're in · sign-in mode (email + password · code · welcome back)
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md (OPEN: add M-1.4 to the spec)
 * @xref    web: W-1.4 — not built
 *
 * One sheet, three stages: email and password → 6-digit code (any digits verify, simulated) → a short
 * "You're in" that moves on by itself to the full-screen health questions (M-1.8).
 * `mode: 'signin'` (Welcome's "Sign in"): the same sheet, without confirm password, ending on
 * "Welcome back" and Home (M-2.0). Any email and password sign in (simulated).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Button, Icon, Input, Sheet } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import { CodeStep } from '@mobile/screens/plans/CreateAccount/parts/CodeStep';
import styles from './CreateProfile.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_LENGTH = 8;
const DONE_MS = 1600;

type Stage = 'form' | 'code' | 'done';

export default function CreateProfile() {
  const { first = '', mode } = useScreenParams<{ first: string; mode: 'signin' }>();
  const signin = mode === 'signin';
  const { dismissSheet, push, resetTo } = useNav();
  const [stage, setStage] = useState<Stage>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      email: EMAIL_PATTERN.test(email.trim()) ? undefined : 'That email doesn’t look quite right.',
      password: signin || password.length >= MIN_LENGTH ? undefined : `Use at least ${MIN_LENGTH} characters.`,
      confirm: signin || password === confirm ? undefined : 'Those passwords don’t match.',
    };
    setErrors(next);
    if (!next.email && !next.password && !next.confirm) setStage('code');
  };

  const verified = () => {
    const s = useAppStore.getState();
    if (signin) {
      // Returning: restore the account; onboarding and the in-chat intake are already behind her.
      s.restoreAccount(email.trim());
      const at = new Date().toISOString();
      s.setIntakeProgress(s.activeProfileId, { step: 'done', completedAt: at, closedAt: at });
      return setStage('done');
    }
    s.setName(first);
    s.createAccount(email.trim());
    s.acceptConsent(consentDoc.version);
    s.acceptTerms();
    setStage('done');
  };

  // "You're in" holds briefly, then the health questions take over the full screen.
  useEffect(() => {
    if (stage !== 'done') return;
    const id = window.setTimeout(() => {
      dismissSheet();
      if (signin) resetTo('main', 'M-2.0');
      else push('M-1.8');
    }, DONE_MS);
    return () => window.clearTimeout(id);
  }, [stage, signin, dismissSheet, push, resetTo]);
  const userName = useAppStore((st) => st.userName);

  return (
    <div data-xref="M-1.4 · Create your profile">
      <Sheet>
        {stage === 'form' && (
          <form key="form" className={styles.stage} onSubmit={submit} noValidate>
            <h2 className={styles.title}>{signin ? 'Welcome back' : 'Create your profile'}</h2>
            <Input label="Email" type="email" placeholder="you@example.com" value={email} autoComplete="email" inputMode="email" error={errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} />
            <Input label="Password" type="password" placeholder={signin ? 'Your password' : 'Create a password'} value={password} autoComplete={signin ? 'current-password' : 'new-password'} hint={signin ? undefined : `At least ${MIN_LENGTH} characters`} error={errors.password} onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); }} />
            {!signin && <Input label="Confirm password" type="password" placeholder="Type it again" value={confirm} autoComplete="new-password" enterKeyHint="go" error={errors.confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: undefined })); }} />}
            <Button type="submit" fullWidth disabled={!email || !password || (!signin && !confirm)}>{signin ? 'Sign in' : 'Get started'}</Button>
          </form>
        )}
        {stage === 'code' && (
          <div key="code" className={styles.stage}>
            <h2 className={styles.title}>Check your email</h2>
            <CodeStep email={email.trim()} onChangeEmail={() => setStage('form')} onVerified={verified} />
          </div>
        )}
        {stage === 'done' && (
          <div key="done" className={styles.done} role="status">
            <span className={styles.check}><Icon name="check" size={32} /></span>
            <h2 className={styles.title}>{signin ? `Welcome back${userName ? `, ${userName}` : ''}.` : `You’re in${first ? `, ${first}` : ''}.`}</h2>
            <p className={styles.sub}>{signin ? 'Taking you home…' : 'Just a few questions so I can get to know you.'}</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
