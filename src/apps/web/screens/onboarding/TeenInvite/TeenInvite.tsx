/**
 * @screen  W-1.12 · Teen invitation email
 * @flow    F06 Family profiles · teen account invite (FigJam teen-account board)
 * @presentation root (pre-auth): the simulated email the teen opens
 * @states  default
 * @figma   —
 * @spec    FigJam "Teen receives email" (OPEN: add to docs/ux/F06-family-profiles.md)
 * @xref    mobile: M-1.12 (apps/mobile/screens/onboarding/TeenInvite)
 *
 * The link is unique to the parent's Family Plan, so the teen skips the open sign-up route:
 * Welcome (name) → age → password with the email already filled and locked.
 */
import { teenAccountCopy as copy } from '@shared/data';
import { Button, DeborahBlob } from '@web/ui';
import { useNav, useScreenParams } from '@web/navigation';
import styles from './TeenInvite.module.css';

const DEMO_TEEN_EMAIL = 'maya@icloud.com';

export default function TeenInvite() {
  const { email = DEMO_TEEN_EMAIL } = useScreenParams<{ email: string }>();
  const { replace } = useNav();
  return (
    <div className={styles.root} data-xref="W-1.12 · Teen invitation email">
      <div className={styles.stage} data-placeholder>
        <DeborahBlob size={88} label={copy.email.from} />
        <header className={styles.header}>
          <p className={styles.small}>From {copy.email.from} · to {email}</p>
          <h1 className={styles.prompt}>{copy.email.subject}</h1>
          {copy.email.body.map((t) => <p key={t} className={styles.lede}>{t}</p>)}
        </header>
        <div className={styles.fields}>
          <Button fullWidth onClick={() => replace('M-1.2', { invite: email }, 'fade')}>{copy.email.cta}</Button>
        </div>
      </div>
    </div>
  );
}
