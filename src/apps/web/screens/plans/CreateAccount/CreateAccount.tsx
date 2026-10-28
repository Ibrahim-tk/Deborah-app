/**
 * @screen  M-4.3 · Save your health history (create account / sign in)
 * @flow    F04 Free limit, plans & account (sign-in mode also from F01 M-1.2)
 * @presentation  push (DerivedPage) · bottom sheet when opened with `{ sheet: true }` (legacy)
 * @states  choose · Apple/Google system sheet · email · verification code · set password (creating only) · verifying
 *          · merge (signing in over a guest who already chatted: keep or discard this phone's conversations)
 * @entry   also from M-2.1's save-your-profile card (`returnTo: 'chat'`, optional `provider`), F01 step 4;
 *          the Home avatar / save card and the hard account gates (sheet, create mode, optional `reason`)
 *          — design direction 2026-10-12, OPEN: not in docs/ux/F04 yet
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=49-353
 * @spec    docs/ux/F04-plans-account.md#m-43--save-your-health-history-create-account--sign-in
 * @xref    web: W-4.3 (apps/web/screens/plans/CreateAccount) — not built
 */
import { useId, useState } from 'react';
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Button, Icon, Input, Panel, Sheet, SocialButton } from '@web/ui';
import { DerivedPage } from '@web/patterns/shell';
import { PhoneField, type PhoneValue } from '@web/patterns/widgets';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useScreenParams } from '@web/navigation';
import { GATE_COPY, resumeGate, type GateReason } from '@web/hooks/useAccountGate';
import { CodeStep } from './parts/CodeStep';
import { MergeStep } from './parts/MergeStep';
import { ProviderSheet, type Provider } from './parts/ProviderSheet';
import styles from './CreateAccount.module.css';

type Step = 'choose' | 'email' | 'code' | 'password' | 'merge';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** TEMP: skip signup/signin field checks for manual journey testing. Set `true` only while testing. */
const SKIP_AUTH_VALIDATION = false;

export default function CreateAccount() {
  const { mode: initialMode = 'create', plan, billing, returnTo, sheet, provider: startWith, reason } = useScreenParams<{
    mode: 'create' | 'signin';
    plan: string;
    billing: string;
    returnTo: string;
    sheet: boolean;
    provider: Provider | 'email';
    reason: GateReason;
  }>();
  const { pop, dismissSheet, presentSheet, resetTo } = useNav();
  const toast = useToast();
  const userName = useAppStore((s) => s.userName);
  const consentId = useId();
  // The chat's save-your-profile card names the method up front (F01 step 4).
  const [step, setStep] = useState<Step>(startWith === 'email' ? 'email' : 'choose');
  const [provider, setProvider] = useState<Provider | null>(startWith && startWith !== 'email' ? startWith : null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [phone, setPhone] = useState<PhoneValue>({ countryCode: '+1', number: '' });
  const [agreed, setAgreed] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [switchedToCreate, setSwitchedToCreate] = useState(false);
  const [pendingAddress, setPendingAddress] = useState('');
  const signin = mode === 'signin';
  const fromChat = returnTo === 'chat';
  // A guest who already chatted has history on this phone that an existing account doesn't know about.
  const guestHistory = useAppStore((s) => !s.accountId && Object.values(s.conversations.byId).some((c) => c.messages.length > 0));
  const handle = (userName || 'maria').toLowerCase().replace(/\s+/g, '.');

  const closeAuth = () => {
    if (sheet) dismissSheet();
    else pop();
  };

  const stepBack = () => {
    if (step === 'choose') return closeAuth();
    setStep(step === 'password' ? 'code' : step === 'code' ? 'email' : 'choose');
  };

  // No real auth: success only writes the store (docs/ux/F04 M-4.3 acceptance).
  const succeed = (address: string) => {
    const s = useAppStore.getState();
    if (signin && guestHistory && step !== 'merge') {
      // Never drop guest data silently: ask first (design direction 2026-10-12).
      setPendingAddress(address);
      return setStep('merge');
    }
    if (signin) {
      s.restoreAccount(address);
      if (reason) resumeGate();
      closeAuth();
      resetTo('main', 'M-2.1');
      // Flush a message held by the guest send gate (or free-limit hold).
      if (useAppStore.getState().heldMessage) useAppStore.getState().releaseHeld();
      toast(`Welcome back, ${useAppStore.getState().userName}`);
    } else if (fromChat) {
      // Guest-chat onboarding: account + consent, then name → HealthBasics → resume chat.
      s.createAccount(address);
      if (phone.number.trim()) s.setContactPhone(phone.countryCode, phone.number);
      s.acceptConsent(consentDoc.version);
      s.acceptTerms();
      closeAuth();
      toast('Your profile is saved');
      presentSheet('M-1.11');
    } else if (sheet) {
      // Guest save from Home (avatar, save card) or a hard gate: stay where she was.
      s.createAccount(address);
      if (phone.number.trim()) s.setContactPhone(phone.countryCode, phone.number);
      dismissSheet();
      toast('Your profile is saved');
      if (reason) resumeGate();
    } else {
      s.createAccount(address);
      if (phone.number.trim()) s.setContactPhone(phone.countryCode, phone.number);
      presentSheet('M-4.4', { plan, billing, returnTo });
    }
  };

  const submitEmail = () => {
    if (SKIP_AUTH_VALIDATION) {
      setEmailError(undefined);
      setStep('code');
      return;
    }
    if (!EMAIL.test(email.trim())) return setEmailError('Enter an email address like maria@example.com.');
    setEmailError(undefined);
    setStep('code');
  };

  const title = step === 'merge' ? 'Keep this phone’s conversations?' : signin ? 'Welcome back' : switchedToCreate ? 'Create your account' : fromChat || sheet ? 'Save your profile' : 'Save your health history';
  const subtitle = step === 'merge'
    ? `You chatted with the Oracle before signing in. Add those conversations to ${pendingAddress}?`
    : signin
      ? 'Sign in to pick up where you left off.'
      : switchedToCreate
        ? 'Make a free account to keep your conversations and pick up on any device.'
        : reason
          ? GATE_COPY[reason]
          : sheet
            ? 'Save your profile so you don’t lose your conversations.'
            : fromChat
              ? 'Your health details need an account behind them to stay protected.'
              : 'Create an account so your consultations stay safe and come with you.';
  const steps = (
    <>
      {step === 'choose' && (
        <div className={styles.group}>
          <SocialButton provider="apple" onClick={() => setProvider('apple')} />
          <SocialButton provider="google" onClick={() => setProvider('google')} />
          <Button variant="secondary" fullWidth leadingIcon="mail" className={styles.compact} onClick={() => setStep('email')}>Continue with email</Button>
          {signin ? (
            // Sign-in ends with a way out for people without an account (design direction 2026-10-12).
            <p className={styles.switch}>
              Don’t have an account? <Button variant="link" className={styles.inlineLink} onClick={() => { setMode('create'); setSwitchedToCreate(true); }}>Sign up</Button>
            </p>
          ) : sheet ? (
            <p className={styles.switch}>
              Already have an account? <Button variant="link" className={styles.inlineLink} onClick={() => { setMode('signin'); setSwitchedToCreate(false); }}>Sign in</Button>
            </p>
          ) : (
            <Button variant="link" aria-expanded={whyOpen} onClick={() => setWhyOpen((o) => !o)}>Why do I need an account?</Button>
          )}
          {whyOpen && (
            <Panel icon="lock">
              <ul className={styles.list}>
                <li>Your history syncs across your devices.</li>
                <li>Everything is stored securely and encrypted.</li>
                <li>{signin ? 'Your plan and conversations are restored.' : 'Your free consultations move with you.'}</li>
              </ul>
            </Panel>
          )}
        </div>
      )}

      {step === 'email' && (
        <form className={styles.group} onSubmit={(e) => {
          e.preventDefault();
          submitEmail();
        }} noValidate>
          <Input label="Email" type="email" autoComplete="email" placeholder={`${handle}@example.com`} autoFocus value={email} error={emailError} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" fullWidth>Continue</Button>
        </form>
      )}

      {/* Email first, then the code; a new account sets its password only after the email is verified. */}
      {step === 'code' && <CodeStep email={email.trim()} onChangeEmail={() => setStep('email')} onVerified={() => (signin ? succeed(email.trim()) : setStep('password'))} />}

      {step === 'password' && (
        <form className={styles.group} onSubmit={(e) => {
          e.preventDefault();
          if (!SKIP_AUTH_VALIDATION && password.length < 8) return setPasswordError('Use at least 8 characters.');
          if (fromChat && !SKIP_AUTH_VALIDATION && !agreed) return;
          setPasswordError(undefined);
          succeed(email.trim());
        }} noValidate>
          <Input label="Set a password" type="password" autoComplete="new-password" hint="At least 8 characters" autoFocus value={password} error={passwordError} onChange={(e) => setPassword(e.target.value)} />
          <PhoneField value={phone} onChange={setPhone} />
          {fromChat && (
            <div className={styles.legal}>
              <input
                id={consentId}
                type="checkbox"
                className={styles.legalInput}
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor={consentId} className={styles.legalRow}>
                <span className={styles.legalBox} data-checked={agreed || undefined} aria-hidden="true">
                  {agreed && <Icon name="check" size={12} strokeWidth={2.5} />}
                </span>
                <span className={styles.legalText}>
                  I agree to the terms of use and Privacy Notice, and to the Oracle’s care disclaimer.
                </span>
              </label>
            </div>
          )}
          <Button type="submit" fullWidth disabled={fromChat && !SKIP_AUTH_VALIDATION && !agreed}>Done</Button>
        </form>
      )}

      {step === 'merge' && (
        <MergeStep
          onKeep={() => succeed(pendingAddress)}
          onDiscard={() => {
            useAppStore.getState().discardGuestData();
            succeed(pendingAddress);
          }}
        />
      )}
    </>
  );
  const providerSheet = (
    <>
      {/* Always mounted so the shared sheet can animate out after Cancel / Continue. */}
      <ProviderSheet
        open={Boolean(provider)}
        provider={provider ?? 'apple'}
        email={`${handle}@${provider === 'google' ? 'gmail.com' : 'icloud.com'}`}
        onCancel={() => setProvider(null)}
        onDone={(address) => {
          setProvider(null);
          succeed(address);
        }}
      />
    </>
  );

  if (sheet) {
    return (
      <div data-xref="M-4.3 · Sign in (sheet)">
        <Sheet title={title}>
          <div className={styles.sheetBody}>
            <p className={styles.why}>{subtitle}</p>
            {steps}
          </div>
        </Sheet>
        {providerSheet}
      </div>
    );
  }

  return (
    <div className={styles.root} data-xref="M-4.3 · Create account">
      <DerivedPage contentWidth={560} title={title} composerPlaceholder="Ask Oracle about your account…" onBack={stepBack} showBack>
        <div className={styles.body}>
          <p className={styles.why}>{subtitle}</p>
          {steps}
        </div>
      </DerivedPage>
      {providerSheet}
    </div>
  );
}
