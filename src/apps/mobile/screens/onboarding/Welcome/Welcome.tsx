/**
 * @screen  M-1.2 · Welcome
 * @flow    F01 First launch & onboarding
 * @states  default · name filled · keyboard open · reading terms (modal)
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=47-184
 * @spec    docs/ux/F01-onboarding.md#m-12--welcome
 * @xref    web: W-1.2 (apps/web/screens/onboarding/Welcome) — not built
 *
 * OPEN: Spec F01 has a separate M-1.3 consent screen with a checkbox. Per design direction (2026-10-08),
 * consent is merged here: "Get started" accepts the Terms & Privacy notice, linked inline. Needs legal sign-off
 * that click-to-accept without a checkbox satisfies the brief/SOW.
 */
import { useState, type FormEvent } from 'react';
import { consentDoc, persona } from '@shared/data';
import { useAppStore } from '@shared/store';
import { Aura, Button, DeborahBlob, Input, TextReveal } from '@mobile/ui';
import { useNav } from '@mobile/navigation';
import styles from './Welcome.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;
const MAX_NAME = 30;

export default function Welcome() {
  const { open, resetTo } = useNav();
  const storedName = useAppStore((s) => s.userName);
  const setName = useAppStore((s) => s.setName);
  const acceptConsent = useAppStore((s) => s.acceptConsent);
  const [name, setDraft] = useState(storedName);
  const [error, setError] = useState<string>();
  const trimmed = name.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    if (!NAME_PATTERN.test(trimmed)) {
      setError('Just your first name is perfect.');
      return;
    }
    setName(trimmed);
    acceptConsent(consentDoc.version);
    resetTo('main', 'M-2.0');
  };

  return (
    <div className={styles.root} data-xref="M-1.2 · Welcome">
      <Aura reach={0.55} />
      <div className={styles.scroll}>
        <div className={styles.portrait}>
          <DeborahBlob size={168} label={persona.name} />
        </div>
        <div className={styles.note} data-placeholder={persona.status === 'placeholder' || undefined}>
          <TextReveal className={styles.hello} text={persona.welcomeNote} delay={500} />
        </div>
        <form className={styles.form} onSubmit={submit} noValidate>
          <Input
            label="What should I call you?"
            placeholder="First name"
            value={name}
            maxLength={MAX_NAME}
            autoCapitalize="words"
            autoComplete="given-name"
            enterKeyHint="go"
            error={error}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(undefined);
            }}
          />
          <Button type="submit" fullWidth disabled={!trimmed}>
            Get started
          </Button>
          <p className={styles.legal} data-placeholder={consentDoc.status === 'placeholder' || undefined}>
            By tapping Get started, you agree to the{' '}
            <button type="button" className={styles.inlineLink} onClick={() => open('M-10.5', { section: 'terms' })}>
              {consentDoc.terms.title}
            </button>{' '}
            and{' '}
            <button type="button" className={styles.inlineLink} onClick={() => open('M-10.5', { section: 'privacy' })}>
              Privacy Notice (HIPAA)
            </button>
            .
          </p>
        </form>
        <p className={styles.signIn}>
          Already have an account?{' '}
          <Button variant="link" onClick={() => open('M-4.3', { mode: 'signin' })}>
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
}

