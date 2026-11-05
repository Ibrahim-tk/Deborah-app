/** Change password (story 12.2): current (checked), new (with live rules), confirm. Simulated in the browser. */
import { useState } from 'react';
import { AUTH_COPY, PASSWORD_RULES as RULES, formatDate, useAdminSettings, useAdminStore, useAuthSecurity } from '@shared/admin';
import { useAdminNav } from '@admin/navigation';
import { Button, Icon, Input } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import { useAdminToast } from '@admin/hooks/toast.store';
import s from './settings.module.css';

export function PasswordSection() {
  const changedAt = useAdminSettings((st) => st.passwordChangedAt);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);
  const [currentWrong, setCurrentWrong] = useState(false);
  const sim = useSim();
  const toast = useAdminToast();

  const rulesMet = RULES.every((r) => r.test(next));
  const mismatch = confirm.length > 0 && confirm !== next;
  const sameAsOld = next.length > 0 && next === current;
  const ready = current && rulesMet && confirm === next && !sameAsOld;

  const save = () => {
    setTried(true);
    if (!ready) return;
    sim.run(() => {
      if (!useAuthSecurity.getState().isCurrent(current)) return setCurrentWrong(true);
      useAuthSecurity.getState().setPassword(next);
      useAdminSettings.getState().changePassword();
      setCurrent(''); setNext(''); setConfirm(''); setTried(false);
      toast('Your password has been changed.');
    }, undefined, 900);
  };
  // Forgot the current one: sign out and go through Forget password (story 1.2).
  const forgot = () => {
    useAdminStore.getState().signOut();
    useAdminNav.getState().setAuth('forgot');
  };

  return (
    <Section title="Password" surface>
      <div className={s.form}>
        <p className={s.note}>Last changed {formatDate(changedAt)}.</p>
        <Input label="Current password" type="password" autoComplete="current-password" value={current}
          error={tried && !current ? 'This field is required.' : currentWrong ? AUTH_COPY.currentWrong : undefined}
          onChange={(e) => { setCurrent(e.target.value); setCurrentWrong(false); }} />
        {/* Same rules panel as Reset password: read before choosing the new one. */}
        <div className={s.rulesBox}>
          <p className={s.rulesTitle}>Your password needs</p>
          <ul className={s.rules} aria-label="Password rules">
            {RULES.map((r) => (
              <li key={r.id} className={s.rule} data-met={r.test(next) || undefined}>
                <Icon name="check" size={14} />
                {r.label}
              </li>
            ))}
          </ul>
        </div>
        <Input label="New password" type="password" autoComplete="new-password" value={next}
          error={tried && !next ? 'This field is required.' : sameAsOld ? AUTH_COPY.reused : undefined} onChange={(e) => setNext(e.target.value)} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm}
          error={tried && !confirm ? 'This field is required.' : mismatch ? 'The passwords don’t match. Please try again.' : undefined} onChange={(e) => setConfirm(e.target.value)} />
        <div className={s.actions}>
          <Button size="sm" loading={sim.busy} disabled={!current && !next && !confirm} onClick={save}>Save</Button>
          <Button size="sm" variant="link" onClick={forgot}>Forgot your password?</Button>
        </div>
        <p className={s.note}>Changing your password signs you out on your other devices.</p>
      </div>
    </Section>
  );
}
