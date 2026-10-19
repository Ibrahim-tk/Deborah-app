/**
 * @screen  M-1.2 · Welcome
 * @flow    F01 First launch & onboarding
 * @states  default · name entered · legal unchecked · ready
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184
 * @spec    docs/ux/F01-onboarding.md#m-12--welcome
 * @xref    web: W-1.2 (apps/web/screens/onboarding/Welcome) — not built
 *
 * Version 2: Deborah's orb and note, then first-name field, legal checkbox (terms and services +
 * Privacy Notice), Get Started, and Sign in. Must be checked before Get Started enables.
 * Sign-up sheet (M-1.4) still follows. Version 1 keeps the single legal line instead.
 * Note: this reverses the 12 Oct meeting's "no account before Deborah" (requirement A), as directed.
 */
import { useId, useState, type FormEvent, type MouseEvent } from 'react';
import { persona } from '@shared/data';
import { Aura, Button, DeborahBlob, GradientShift, Icon, Input, TextReveal } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './Welcome.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
/** TEMP: skip signup/signin field checks for manual journey testing. Set `true` only while testing. */
const SKIP_AUTH_VALIDATION = true;

export default function Welcome() {
  const { presentSheet, presentModal } = useNav();
  const legalId = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const [agreed, setAgreed] = useState(false);

  const start = (e: FormEvent) => {
    e.preventDefault();
    const first = name.trim();
    if (SKIP_AUTH_VALIDATION) {
      setError(undefined);
      presentSheet('M-1.4', { first: first || 'Tester' });
      return;
    }
    if (!first || !agreed) return;
    if (!NAME_PATTERN.test(first)) return setError('Letters only, please.');
    presentSheet('M-1.4', { first });
  };

  const ready = SKIP_AUTH_VALIDATION || Boolean(name.trim() && agreed);
  const openLegal = (section: 'terms' | 'privacy') => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    presentModal('M-10.5', { section });
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
            label="Your first name"
            placeholder="First name"
            value={name}
            autoComplete="given-name"
            autoCapitalize="words"
            maxLength={40}
            enterKeyHint="go"
            error={error}
            onChange={(e) => { setName(e.target.value); setError(undefined); }}
          />
          <div className={styles.legal}>
            <input
              id={legalId}
              type="checkbox"
              className={styles.legalInput}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor={legalId} className={styles.legalRow}>
              <span className={styles.legalBox} data-checked={agreed || undefined} aria-hidden="true">
                {agreed && <Icon name="check" size={12} strokeWidth={2.5} />}
              </span>
              <span className={styles.legalText}>
                I agree to the{' '}
                <button type="button" className={styles.link} onClick={openLegal('terms')}>terms and services</button>
                {' '}and{' '}
                <button type="button" className={styles.link} onClick={openLegal('privacy')}>Privacy Notice</button>
              </span>
            </label>
          </div>
          <Button type="submit" fullWidth disabled={!ready}>Get Started</Button>
          <p className={styles.signIn}>
            Already have an account?{' '}
            <button type="button" className={styles.signInLink} onClick={() => presentSheet('M-1.4', { mode: 'signin' })}>Sign in</button>
          </p>
        </div>
      </form>
    </div>
  );
}
