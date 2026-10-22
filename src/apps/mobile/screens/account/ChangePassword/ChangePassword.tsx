/**
 * @screen  M-10.7 · Change password
 * @flow    F10 Account, privacy & data
 * @states  form · set (brief confirmation) · back to Settings
 * @figma   —
 * @spec    docs/ux/F10-account-privacy.md (OPEN: add M-10.7) — UI mirrors ForgotPassword password step
 * @xref    web: W-10.7 — not built
 *
 * Full push page (not a sheet). Current + new + confirm. No backend — simulated (CLAUDE.md).
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Button, Header, Icon, Input } from '@mobile/ui';
import { useToast } from '@mobile/hooks/toast.store';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './ChangePassword.module.css';

const MIN_LENGTH = 8;
const SET_MS = 1400;
/** TEMP: skip field checks for manual journey testing. Set `true` only while testing. */
const SKIP_AUTH_VALIDATION = true;

export default function ChangePassword() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; password?: string; confirm?: string }>({});
  const [done, setDone] = useState(false);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (SKIP_AUTH_VALIDATION) {
      setErrors({});
      setDone(true);
      return;
    }
    const next = {
      current: current ? undefined : 'Enter your current password.',
      password: password.length >= MIN_LENGTH ? undefined : `Use at least ${MIN_LENGTH} characters.`,
      confirm: password === confirm ? undefined : 'Those passwords don’t match.',
    };
    setErrors(next);
    if (!next.current && !next.password && !next.confirm) setDone(true);
  };

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => {
      toast('Password updated');
      pop();
    }, SET_MS);
    return () => window.clearTimeout(id);
  }, [done, pop, toast]);

  return (
    <div className={styles.root} data-xref="M-10.7 · Change password">
      <Header title="Change password" onBack={pop} backLabel={previousTitle} />
      <div className={styles.body}>
        {done ? (
          <div className={styles.done} role="status">
            <span className={styles.check}><Icon name="check" size={32} /></span>
            <h2 className={styles.title}>Your password is set.</h2>
            <p className={styles.sub}>Taking you back…</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={save} noValidate>
            <p className={styles.lede}>At least {MIN_LENGTH} characters for the new password.</p>
            <Input
              label="Current password"
              type="password"
              placeholder="Enter your current password"
              value={current}
              autoComplete="current-password"
              error={errors.current}
              onChange={(e) => { setCurrent(e.target.value); setErrors((x) => ({ ...x, current: undefined })); }}
            />
            <Input
              label="New password"
              type="password"
              placeholder="Enter a new password"
              value={password}
              autoComplete="new-password"
              error={errors.password}
              onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); }}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Confirm your new password"
              value={confirm}
              autoComplete="new-password"
              enterKeyHint="go"
              error={errors.confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: undefined })); }}
            />
            <Button
              type="submit"
              fullWidth
              disabled={SKIP_AUTH_VALIDATION ? false : !current || !password || !confirm}
            >
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
