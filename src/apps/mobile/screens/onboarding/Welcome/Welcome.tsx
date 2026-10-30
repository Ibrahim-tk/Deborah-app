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
 * Health-data consent is a separate required step, but legal/consent.json › healthConsent has no
 * attorney body yet. Do not render that checkbox until `healthConsent.body` is supplied.
 * Sign-up sheet (M-1.4) still follows. Version 1 keeps the single legal line instead.
 * Note: this reverses the 12 Oct meeting's "no account before Deborah" (requirement A), as directed.
 */
import { useId, useState, type FormEvent, type MouseEvent } from 'react';
import { persona, teenAccountCopy } from '@shared/data';
import { Aura, Button, DeborahBlob, GradientShift, Icon, Input, TextReveal } from '@mobile/ui';
import { useNav, useScreenParams } from '@mobile/navigation';
import styles from './Welcome.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
/** TEMP: skip signup/signin field checks for manual journey testing. Set `true` only while testing. */
const SKIP_AUTH_VALIDATION = false;

export default function Welcome() {
  const { presentSheet } = useNav();
  // Arrived from a teen invitation (M-1.12): the email is already known; no sign-in link.
  const { invite } = useScreenParams<{ invite?: string }>();
  const legalId = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const [agreed, setAgreed] = useState(false);

  const start = (e: FormEvent) => {
    e.preventDefault();
    const first = name.trim();
    if (SKIP_AUTH_VALIDATION) {
      setError(undefined);
      presentSheet('M-1.13', { first: first || 'Tester', invite });
      return;
    }
    // Invited teens: the parent gave consent, so no terms checkbox (story 1.5).
    if (!first || (!agreed && !invite)) return;
    if (!NAME_PATTERN.test(first)) return setError('Letters only, please.');
    // Age right after the name (teen-account board), then the sign-up sheet.
    presentSheet('M-1.13', { first, invite });
  };

  const ready = SKIP_AUTH_VALIDATION || Boolean(name.trim() && (agreed || invite));
  const openLegal = (section: 'terms' | 'privacy') => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    presentSheet('M-1.5', { section });
  };

  return (
    <div className={styles.root} data-xref="M-1.2 · Welcome">
      <Aura rise />
      <GradientShift />
      <form className={styles.scroll} onSubmit={start} noValidate>
        <div className={styles.intro}>
          <DeborahBlob size={112} label={persona.name} />
          <div className={styles.note} data-placeholder={persona.status === 'placeholder' || undefined}>
            {/* Teen invite: say plainly this is the teen's own sign-up (story 1.5). */}
            <TextReveal as="h1" className={styles.hello} text={invite ? teenAccountCopy.setup.title : persona.welcomeTitle} delay={500} />
            {invite ? (
              // The parent-entered email sits inside the sentence, bold, same size and colour.
              <p className={styles.lede}>
                {teenAccountCopy.setup.lede.split('{email}')[0]}
                <strong className={styles.inviteAddress}>{invite}</strong>
                {teenAccountCopy.setup.lede.split('{email}')[1]}
              </p>
            ) : (
              <TextReveal className={styles.lede} text={persona.welcomeNote} delay={800} />
            )}
          </div>
        </div>
        <div className={styles.bottom}>
          {/* The email the parent entered; it comes from the invitation and can't be changed. */}
          <Input
            label="What should we call you?"
            placeholder="First name"
            value={name}
            autoComplete="given-name"
            autoCapitalize="words"
            maxLength={40}
            enterKeyHint="go"
            error={error}
            onChange={(e) => { setName(e.target.value); setError(undefined); }}
          />
          {!invite && <div className={styles.legal}>
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
          </div>}
          <Button type="submit" fullWidth disabled={!ready}>Get Started</Button>
          {!invite && <p className={styles.signIn}>
            Already have an account?{' '}
            <button type="button" className={styles.signInLink} onClick={() => presentSheet('M-1.4', { mode: 'signin' })}>Sign in</button>
          </p>}
        </div>
      </form>
    </div>
  );
}
