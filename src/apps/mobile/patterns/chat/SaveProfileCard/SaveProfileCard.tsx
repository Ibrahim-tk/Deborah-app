/**
 * @pattern SaveProfileCard — after the first useful answer: "Save your profile" with Apple, Google
 *          or email. A name-only user is anonymous; health data needs an account behind it.
 *          Resolved states: saved (account exists) · dismissed ("Not now").
 * @usedBy  M-2.1 (message kind `saveProfile`)
 * @spec    docs/ux/F01-onboarding.md#4--after-the-first-useful-answer
 * @xref    web: apps/web/patterns/chat/SaveProfileCard — not built
 */
import { Button, Icon, SocialButton } from '@mobile/ui';
import styles from './SaveProfileCard.module.css';

export interface SaveProfileCardProps {
  /** Account email once saved. */
  savedAs?: string;
  dismissed?: boolean;
  onProvider: (provider: 'apple' | 'google' | 'email') => void;
  onNotNow: () => void;
}

export function SaveProfileCard({ savedAs, dismissed, onProvider, onNotNow }: SaveProfileCardProps) {
  if (savedAs) {
    return (
      <p className={styles.note}>
        <Icon name="check" size={16} /> Profile saved to {savedAs}
      </p>
    );
  }
  if (dismissed) return <p className={styles.note}>You can save your profile any time from Account.</p>;

  return (
    <section className={styles.root} aria-labelledby="save-profile-title">
      <div className={styles.intro}>
        <h3 id="save-profile-title" className={styles.title}>Save your profile</h3>
        <p className={styles.body}>Keep what you’ve shared safe and with you on any device. Right now it lives only on this phone.</p>
      </div>
      <div className={styles.actions}>
        <SocialButton provider="apple" onClick={() => onProvider('apple')} />
        <SocialButton provider="google" onClick={() => onProvider('google')} />
        <Button variant="secondary" fullWidth leadingIcon="mail" onClick={() => onProvider('email')}>
          Continue with email
        </Button>
        <Button variant="link" onClick={onNotNow}>Not now</Button>
      </div>
    </section>
  );
}
