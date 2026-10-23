/**
 * @screen  M-4.0 · Guest auth gate
 * @flow    Web guest chat — after first send (or Sign in / Sign up)
 * @presentation sheet (centered Untitled-UI style dialog)
 * @states  email · code · password (create) · signin email · signin code
 * @spec    web guest-chat onboarding
 * @xref    web: W-4.0 (apps/web/screens/plans/GuestAuth)
 */
import { useState, type FormEvent } from 'react';
import { consentDoc } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Button, DeborahBlob, IconButton, Input } from '@web/ui';
import { useToast } from '@web/hooks/toast.store';
import { useNav, useScreenParams } from '@web/navigation';
import { CodeStep } from '../CreateAccount/parts/CodeStep';
import styles from './GuestAuth.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = 'create' | 'signin';
type Step = 'email' | 'code' | 'password';

export default function GuestAuth() {
  const { mode: initialMode = 'create' } = useScreenParams<{ mode: Mode }>();
  const { dismissSheet, presentSheet } = useNav();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();

  const signin = mode === 'signin';

  const finishCreate = (address: string) => {
    const s = useAppStore.getState();
    s.createAccount(address);
    s.acceptConsent(consentDoc.version);
    s.acceptTerms();
    dismissSheet();
    toast('Your profile is saved');
    presentSheet('M-1.11');
  };

  const finishSignin = (address: string) => {
    const s = useAppStore.getState();
    s.restoreAccount(address);
    dismissSheet();
    toast(`Welcome back, ${useAppStore.getState().userName}`);
    if (s.heldMessage) s.releaseHeld();
  };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setEmailError('Enter an email address like maria@example.com.');
    setEmailError(undefined);
    setStep('code');
  };

  return (
    <div className={styles.root} data-xref="M-4.0 · Guest auth">
      <IconButton icon="close" label="Close" className={styles.close} onClick={dismissSheet} />
      <div className={styles.hero}>
        <DeborahBlob size={88} label="Deborah" />
        <h1 className={styles.title}>Sign in or sign up</h1>
        <p className={styles.body}>Start conversation with Deborah</p>
      </div>

      {step === 'email' && (
        <form className={styles.form} onSubmit={submitEmail} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            value={email}
            error={emailError}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(undefined);
            }}
          />
          <Button type="submit" fullWidth>
            Continue
          </Button>
          {signin ? (
            <p className={styles.switch}>
              Don’t have an account?{' '}
              <Button
                variant="link"
                className={styles.link}
                onClick={() => {
                  setMode('create');
                  setStep('email');
                }}
              >
                Sign up
              </Button>
            </p>
          ) : (
            <p className={styles.switch}>
              Already have an account?{' '}
              <Button
                variant="link"
                className={styles.link}
                onClick={() => {
                  setMode('signin');
                  setStep('email');
                }}
              >
                Sign in
              </Button>
            </p>
          )}
        </form>
      )}

      {step === 'code' && (
        <div className={styles.form}>
          <CodeStep
            email={email.trim()}
            onChangeEmail={() => setStep('email')}
            onVerified={() => (signin ? finishSignin(email.trim()) : setStep('password'))}
          />
        </div>
      )}

      {step === 'password' && (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < 8) return setPasswordError('Use at least 8 characters.');
            setPasswordError(undefined);
            finishCreate(email.trim());
          }}
          noValidate
        >
          <Input
            label="Set a password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            autoFocus
            value={password}
            error={passwordError}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth>
            Continue
          </Button>
        </form>
      )}
    </div>
  );
}
