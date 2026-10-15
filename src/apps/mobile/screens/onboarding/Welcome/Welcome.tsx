/**
 * @screen  M-1.2 · Welcome
 * @flow    F01 First launch & onboarding
 * @states  default · name entered
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184
 * @spec    docs/ux/F01-onboarding.md#m-12--welcome
 * @xref    web: W-1.2 (apps/web/screens/onboarding/Welcome) — not built
 *
 * Onboarding plan P-05 (design direction 2026-10-15): Deborah's orb and note, then "What should I call you?"
 * (first name) and Get Started, which opens the sign-up sheet (M-1.4: email + password, code, "you're in"),
 * then the onboarding profile (M-1.8). M-1.4 accepts the Terms and Privacy and creates the account on verify.
 * "Sign in" opens the same sheet in sign-in mode (email + password, code, Home).
 * Note: this reverses the 12 Oct meeting's "no account before Deborah" (requirement A), as directed.
 */
import { useState, type FormEvent } from 'react';
import { persona } from '@shared/data';
import { Aura, Button, DeborahBlob, GradientShift, Input, TextReveal } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './Welcome.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;

export default function Welcome() {
  const { presentSheet, presentModal } = useNav();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();

  const start = (e: FormEvent) => {
    e.preventDefault();
    const first = name.trim();
    if (!first) return;
    if (!NAME_PATTERN.test(first)) return setError('Letters only, please.');
    presentSheet('M-1.4', { first });
  };

  return (
    <div className={styles.root} data-xref="M-1.2 · Welcome">
      <Aura rise />
      <GradientShift />
      <form className={styles.scroll} onSubmit={start} noValidate>
        <div className={styles.intro}>
          <DeborahBlob size={112} label={persona.name} />
          <div className={styles.note} data-placeholder={persona.status === 'placeholder' || undefined}>
            <TextReveal className={styles.hello} text={persona.welcomeNote} delay={500} />
          </div>
        </div>
        <div className={styles.bottom}>
          <Input
            label="What should I call you?"
            placeholder="First name"
            value={name}
            autoComplete="given-name"
            autoCapitalize="words"
            maxLength={40}
            enterKeyHint="go"
            error={error}
            onChange={(e) => { setName(e.target.value); setError(undefined); }}
          />
          <Button type="submit" fullWidth disabled={!name.trim()}>Get Started</Button>
          <p className={styles.legal}>
            By continuing you agree to our{' '}
            <button type="button" className={styles.link} onClick={() => presentModal('M-10.5', { section: 'terms' })}>Terms</button> and{' '}
            <button type="button" className={styles.link} onClick={() => presentModal('M-10.5', { section: 'privacy' })}>Privacy</button>.
          </p>
          <p className={styles.signIn}>
            Already have an account?{' '}
            <button type="button" className={styles.signInLink} onClick={() => presentSheet('M-1.4', { mode: 'signin' })}>Sign in</button>
          </p>
        </div>
      </form>
    </div>
  );
}
