/**
 * @screen  M-1.4 · Create your profile
 * @flow    F01 First launch & onboarding (design direction 2026-10-13 rev 5)
 * @presentation full-screen fade from Welcome (M-1.2) — naked, no sheet/container
 * @states  email · password · phone (optional) · code · you're in · sign-in (email · password · code · welcome back)
 *          · forgot password (email · code · new password · password set)
 * @figma   —
 * @spec    docs/ux/F01-onboarding.md (OPEN: add M-1.4 to the spec)
 * @xref    web: W-1.4 — not built
 *
 * Sign-up (2026-10-23): one screen — "Welcome, {name}" with email, password, confirm password and optional
 * phone → 6-digit code → "Account created", then health questions (M-1.8). `mode: 'signin'`: email + password,
 * ending on Home (M-2.0). Any email and password sign in (simulated). Sign-in has "Forgot password?"
 * under the password. See parts/ForgotPassword.
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { consentDoc } from '@shared/data';
import { loadScenario, useAppStore } from '@shared/store';
import { cx } from '@shared/utils';
import { Button, Input, TextReveal } from '@web/ui';
import { PhoneField, type PhoneValue } from '@web/patterns/widgets';
import { countryFor, isValidPhone, type CountryCode } from '@shared/utils/phone';
import { useNav, useScreenParams } from '@web/navigation';
import { CodeStep } from '@web/screens/plans/CreateAccount/parts/CodeStep';
import { ForgotPassword } from './parts/ForgotPassword';
import styles from './CreateProfile.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_LENGTH = 8;
const DONE_MS = 1600;
/** Keep outgoing step on screen while it fades up (matches `.stageLeaving`). */
const EXIT_MS = 240;
/** TEMP: skip signup/signin field checks for manual journey testing. Set `true` only while testing. */
const SKIP_AUTH_VALIDATION = true;
/** PDF persona auto-run: shorter “You’re in” hold (still readable at ~0.5× normal step pace). */
const fastDoneMs = () => (document.documentElement.dataset.yocFastSignup === '1' ? 700 : DONE_MS);

type Stage = 'email' | 'password' | 'phone' | 'code' | 'forgot' | 'done';

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
  const { first = '', mode, stage: initialStage = 'email' } = useScreenParams<{
    first: string;
    mode: 'signin';
    /** Legacy Screens-menu value `form` maps to email. */
    stage: Stage | 'form';
  }>();
  const signin = mode === 'signin';
  const { replace } = useNav();
  const [stage, setStage] = useState<Stage>(initialStage === 'form' || initialStage === 'password' || initialStage === 'phone' ? 'email' : initialStage);
  const [view, setView] = useState(stage);
  const leaving = view !== stage;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState<PhoneValue>({ countryCode: '+1', number: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; phone?: string }>({});

  // Outgoing question fades up, then the next fades in.
  useEffect(() => {
    if (!leaving) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(() => setView(stage), reduced ? 0 : EXIT_MS);
    return () => window.clearTimeout(id);
  }, [leaving, stage]);

  // One screen: email + password (+ confirm + optional phone on sign-up), then the code.
  const submitDetails = (e: FormEvent) => {
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
      phone: signin || !phone.number.trim() || isValidPhone(countryFor(phone.country, phone.countryCode).iso as CountryCode, phone.number) ? undefined : 'Enter a valid phone number for that country.',
    };
    setErrors(next);
    if (!next.email && !next.password && !next.confirm && !next.phone) setStage('code');
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
    s.createAccount(email.trim());
    if (phone.number.trim()) s.setContactPhone(phone.countryCode, phone.number);
    s.acceptConsent(consentDoc.version);
    s.acceptTerms();
    setStage('done');
  };

  // "You're in" holds briefly, then the health questions take over the full screen.
  useEffect(() => {
    if (view !== 'done') return;
    const id = window.setTimeout(() => {
      if (signin) restoreReturning(email.trim());
      else replace('M-1.8', undefined, 'fade');
    }, fastDoneMs());
    return () => window.clearTimeout(id);
  }, [view, signin, email, replace]);

  const prompt =
    view === 'email'
      ? signin
        ? 'Welcome back'
        : first
          ? `Welcome, ${first}`
          : 'Welcome'
      : view === 'code'
        ? 'Check your email'
        : undefined;

  const lede =
    view === 'email'
      ? signin
        ? 'Sign in to pick up where you left off.'
        : 'It’s lovely to have you here. Create your account to keep your conversations in one place.'
      : undefined;

  return (
    <div className={styles.root} data-xref="M-1.4 · Create your profile">
      <div key={view} className={cx(styles.stage, leaving && styles.stageLeaving)}>
        {view === 'forgot' ? (
          <ForgotPassword initialEmail={email} onCancel={() => setStage('email')} onComplete={signIn} />
        ) : (
          <>
            {prompt && (
              <header className={styles.header}>
                <TextReveal as="h1" className={styles.prompt} text={prompt} delay={200} />
                {lede && <TextReveal className={styles.lede} text={lede} delay={500} />}
              </header>
            )}
            {view === 'email' && (
              <form className={styles.fields} onSubmit={submitDetails} noValidate>
                <Input
                  label="Email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  error={errors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((x) => ({ ...x, email: undefined }));
                  }}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder={signin ? 'Your password' : `At least ${MIN_LENGTH} characters`}
                  value={password}
                  autoComplete={signin ? 'current-password' : 'new-password'}
                  error={errors.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((x) => ({ ...x, password: undefined }));
                  }}
                />
                {signin && (
                  <button type="button" className={styles.forgot} onClick={() => setStage('forgot')}>
                    Forgot password?
                  </button>
                )}
                {!signin && (
                  <>
                    <Input
                      label="Confirm password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirm}
                      autoComplete="new-password"
                      error={errors.confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        setErrors((x) => ({ ...x, confirm: undefined }));
                      }}
                    />
                    {/* Optional — leave blank to skip. */}
                    <PhoneField value={phone} error={errors.phone} onChange={(v) => { setPhone(v); setErrors((x) => ({ ...x, phone: undefined })); }} />
                  </>
                )}
                <Button type="submit" fullWidth disabled={SKIP_AUTH_VALIDATION ? false : !email || !password || (!signin && !confirm)}>
                  Continue
                </Button>
              </form>
            )}
            {view === 'code' && (
              <div className={styles.code}>
                <CodeStep email={email.trim()} onChangeEmail={() => setStage('email')} onVerified={verified} />
              </div>
            )}
            {view === 'done' && (
              <div className={styles.done} role="status">
                <span className={styles.check}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      className={styles.tick}
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                    />
                  </svg>
                </span>
                <TextReveal
                  as="h2"
                  className={styles.title}
                  text={signin ? `Welcome back, ${nameFromEmail(email)}.` : `Account created${first ? `, ${first}` : ''}.`}
                  delay={200}
                />
                <TextReveal
                  className={styles.sub}
                  text={signin ? 'Taking you back to where you left off…' : 'Your account is ready. Next, a few short questions so I can tailor my guidance to you.'}
                  delay={500}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
