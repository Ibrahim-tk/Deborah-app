/**
 * @screen  M-1.4 · Create your profile
 * @flow    F01 First launch & onboarding (design direction 2026-10-13 rev 5)
 * @presentation sheet over Welcome (M-1.2), which already asked for the first name
 * @states  form (email + password) · field error · code · you're in · sign-in mode (email + password · code · welcome back)
 *          · forgot password (email · code · new password · password set)
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md (OPEN: add M-1.4 to the spec)
 * @xref    web: W-1.4 — not built
 *
 * One sheet, three stages: email and password → 6-digit code (any digits verify, simulated) → a short
 * "You're in" that moves on by itself to the full-screen health questions (M-1.8).
 * `mode: 'signin'` (Welcome's "Sign in"): the same sheet, without confirm password, ending on
 * "Welcome back" and Home (M-2.0). Any email and password sign in (simulated).
 * `invite` (teen invitation, M-1.12): email prefilled and locked, no code step, then "Your Oracle for teens" → M-1.8.
 * Sign-in has "Forgot password?" under the password: email → code → new password → "Your password is set"
 * → signed in automatically ("Welcome back" → Home). See parts/ForgotPassword.
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { consentDoc, teenAccountCopy } from '@shared/data';
import { loadScenario, selectIsUnderAge, useAppStore } from '@shared/store';
import { Button, Input, Sheet } from '@mobile/ui';
import type { PhoneValue } from '@mobile/patterns/widgets';
import { useNav, useScreenParams } from '@mobile/navigation';
import { CodeStep } from '@mobile/screens/plans/CreateAccount/parts/CodeStep';
import { ForgotPassword } from './parts/ForgotPassword';
import styles from './CreateProfile.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_LENGTH = 8;
const DONE_MS = 1600;
/** TEMP: skip signup/signin field checks for manual journey testing. Set `true` only while testing. */
const SKIP_AUTH_VALIDATION = false;
/** PDF persona auto-run: shorter “You’re in” hold (still readable at ~0.5× normal step pace). */
const fastDoneMs = () => (document.documentElement.dataset.yocFastSignup === '1' ? 700 : DONE_MS);

type Stage = 'form' | 'code' | 'forgot' | 'done' | 'teen';

/** "maria.lopez@…" → "Maria". */
const nameFromEmail = (email: string) => {
  const w = email.split('@')[0].split(/[._-]/)[0] ?? '';
  return w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : 'there';
};

/**
 * Simulated account restore: a returning user with a finished health profile, health consent and a
 * past consultation (seed R01), so Home shows "continue where you left off" and the chat never asks
 * onboarding questions again. Her email and name replace the seed's. Lands on Home (the seed's start).
 */
function restoreReturning(email: string) {
  loadScenario('R01');
  const name = nameFromEmail(email);
  const s = useAppStore.getState();
  useAppStore.setState({ accountEmail: email, userName: name });
  s.updateProfile(s.activeProfileId, { name });
}

export default function CreateProfile() {
  // `stage` lets the internal Screens menu open straight on 2FA or forgot password.
  const { first = '', mode, invite, stage: initialStage = 'form' } = useScreenParams<{ first: string; mode: 'signin'; invite?: string; stage: Stage }>();
  const signin = mode === 'signin';
  const { dismissSheet, push } = useNav();
  const [stage, setStage] = useState<Stage>(initialStage);
  const [forgotHeader, setForgotHeader] = useState<{ title?: string; subtitle?: string }>({});
  // Teen invite (M-1.12): the email comes from the invitation link and cannot be changed.
  const [email, setEmail] = useState(invite ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone] = useState<PhoneValue>({ countryCode: '+1', number: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (SKIP_AUTH_VALIDATION) {
      setErrors({});
      setStage('code');
      return;
    }
    const next = {
      email: EMAIL_PATTERN.test(email.trim()) ? undefined : 'That email doesn’t look quite right.',
      password: signin || password.length >= MIN_LENGTH ? undefined : `Use at least ${MIN_LENGTH} characters.`,
      confirm: signin || password === confirm ? undefined : 'Those passwords don’t match.',
    };
    setErrors(next);
    // The invitation link already proved the email: no code step.
    if (!next.email && !next.password && !next.confirm) return invite ? verified() : setStage('code');
  };

  // Returning: restore the account; onboarding and the in-chat intake are already behind her.
  const signIn = useCallback((address: string) => {
    const s = useAppStore.getState();
    s.restoreAccount(address);
    const at = new Date().toISOString();
    s.setIntakeProgress(s.activeProfileId, { step: 'done', completedAt: at, closedAt: at });
    setStage('done');
  }, []);

  const verified = () => {
    const s = useAppStore.getState();
    if (signin) return signIn(email.trim());
    s.setName(first);
    if (invite) s.acceptTeenInvite(email.trim());
    else s.createAccount(email.trim());
    if (phone.number.trim()) s.setContactPhone(phone.countryCode, phone.number);
    s.acceptConsent(consentDoc.version);
    s.acceptTerms();
    // "Your Oracle for teens" only when the age check puts them in the teen category.
    // OPEN: an invited adult (18+) — the story doesn't say; they continue as a teen account without the notice.
    setStage(invite && selectIsUnderAge(s) ? 'teen' : 'done');
  };

  // "You're in" holds briefly, then the health questions take over the full screen.
  useEffect(() => {
    if (stage !== 'done') return;
    const id = window.setTimeout(() => {
      dismissSheet();
      if (signin) restoreReturning(email.trim());
      else push('M-1.8');
    }, fastDoneMs());
    return () => window.clearTimeout(id);
  }, [stage, signin, email, dismissSheet, push]);

  return (
    <div data-xref="M-1.4 · Create your profile">
      <Sheet
        title={stage === 'form' ? (signin ? 'Welcome back' : `Welcome${first ? `, ${first}` : ''}`) : stage === 'code' ? 'Check your email' : stage === 'forgot' ? forgotHeader.title : undefined}
        subtitle={stage === 'form' ? (signin ? 'Sign in to pick up where you left off.' : 'Create your account so the Oracle remembers your story.') : stage === 'forgot' ? forgotHeader.subtitle : undefined}
      >
        {stage === 'teen' && (
          <div key="teen" className={styles.stage} data-placeholder>
            <h2 className={styles.title}>{teenAccountCopy.welcome.title}</h2>
            <p className={styles.sub}>{teenAccountCopy.welcome.body}</p>
            <Button fullWidth onClick={() => { dismissSheet(); push('M-1.8'); }}>{teenAccountCopy.welcome.cta}</Button>
          </div>
        )}
        {stage === 'form' && (
          <form key="form" className={styles.stage} onSubmit={submit} noValidate>
            {/* OPEN: placeholder UX copy until reviewed. Heading + subtitle live in the sheet header. */}
            <Input label="Email" type="email" placeholder="Your email" value={email} readOnly={Boolean(invite)} autoComplete="email" inputMode="email" error={errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} />
            <Input label="Password" type="password" placeholder="Enter your password" value={password} autoComplete={signin ? 'current-password' : 'new-password'} error={errors.password} onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); }} />
            {signin && <button type="button" className={styles.forgot} onClick={() => setStage('forgot')}>Forgot password?</button>}
            {!signin && <Input label="Confirm password" type="password" placeholder="Confirm your password" value={confirm} autoComplete="new-password" enterKeyHint="go" error={errors.confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: undefined })); }} />}
            <Button type="submit" fullWidth disabled={SKIP_AUTH_VALIDATION ? false : !email || !password || (!signin && !confirm)}>{signin ? 'Sign in' : 'Create account'}</Button>
          </form>
        )}
        {stage === 'code' && (
          <div key="code" className={styles.stage}>
            <CodeStep email={email.trim()} onChangeEmail={() => setStage('form')} onVerified={verified} />
          </div>
        )}
        {stage === 'forgot' && <ForgotPassword initialEmail={email} onCancel={() => setStage('form')} onComplete={signIn} onHeader={setForgotHeader} />}
        {stage === 'done' && (
          <div key="done" className={styles.done} role="status">
            <span className={styles.check}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path className={styles.tick} d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} /></svg></span>
            <h2 className={styles.title}>{signin ? `Welcome back, ${nameFromEmail(email)}.` : `Account created${first ? `, ${first}` : ''}.`}</h2>
            <p className={styles.sub}>{signin ? 'Taking you home…' : 'A few quick questions so I know who I’m talking to.'}</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
