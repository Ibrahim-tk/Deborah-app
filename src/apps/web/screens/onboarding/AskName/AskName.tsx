/**
 * @screen  M-1.11 · Your name
 * @flow    F01 guest-chat onboarding — after M-4.3 create, before HealthBasics (M-1.8)
 * @presentation sheet
 * @states  default · name entered
 * @figma   —
 * @spec    web guest-chat onboarding
 * @xref    web: W-1.11 (apps/web/screens/onboarding/AskName)
 */
import { useState, type FormEvent } from 'react';
import { useAppStore } from '@shared/store';
import { Button, Input, Sheet } from '@web/ui';
import { useNav } from '@web/navigation';
import styles from './AskName.module.css';

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’-]*$/u;

export default function AskName() {
  const { dismissSheet, push } = useNav();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();

  const continueOn = (e: FormEvent) => {
    e.preventDefault();
    const first = name.trim();
    if (!first) return setError('Enter your first name.');
    if (!NAME_PATTERN.test(first)) return setError('Letters only, please.');
    useAppStore.getState().setName(first);
    dismissSheet();
    // Age step (W-1.13) before the health basics.
    push('M-1.13', { first, next: 'health' });
  };

  return (
    <div data-xref="M-1.11 · Your name">
      <Sheet title="What should the Oracle call you?">
        <form className={styles.body} onSubmit={continueOn} noValidate>
          <Input
            label="What should we call you?"
            placeholder="First name"
            value={name}
            autoComplete="given-name"
            autoCapitalize="words"
            autoFocus
            maxLength={40}
            enterKeyHint="go"
            error={error}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
          />
          <Button type="submit" fullWidth disabled={!name.trim()}>
            Continue
          </Button>
        </form>
      </Sheet>
    </div>
  );
}
