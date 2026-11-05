/**
 * @screen  A-6.3 · Admin account setup (opened from the invite email)
 * @flow    A6 Admin management (story 7.2)
 * @states  password (rules, match) · done (signed in to that admin's dashboard) · invite expired · invite already used
 * @spec    docs/admin/README.md#a-63-admin-account-setup
 * @xref    web: none (admin only)
 * The invite email's link lands here. Email stays locked. A valid password signs this admin in
 * and opens their dashboard (plain admins do not see subscriptions or admin users).
 */
import { useState, type FormEvent } from 'react';
import { inviteHoursLeft, PASSWORD_RULES, PASSWORD_RULES_ERROR, meetsPasswordRules, useAdminStore, useAuthSecurity, useInviteLink } from '@shared/admin';
import { Button, Icon, Input } from '@admin/ui';
import { AuthLayout } from '@admin/patterns';
import { useAdminNav } from '@admin/navigation';
import { useSim } from '@admin/hooks/useSim';
import styles from '../auth.module.css';

export default function AcceptInvite({ adminId }: { adminId: string }) {
  const admin = useAdminStore((s) => s.admins.find((a) => a.id === adminId));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);
  const { busy, run } = useSim();

  const close = () => useInviteLink.getState().clear();

  if (!admin) {
    return (
      <AuthLayout title="Invite unavailable">
        <div className={styles.form}>
          <p className={styles.note}>This invite link doesn’t match an admin.</p>
          <Button fullWidth onClick={close}>Close</Button>
        </div>
      </AuthLayout>
    );
  }

  const hours = inviteHoursLeft(admin.invitedAt);
  const expired = admin.invite === 'expired' || (admin.invite === 'pending' && hours <= 0);
  if (expired || admin.invite === 'accepted') {
    return (
      <AuthLayout title={expired ? 'Invite expired' : 'Invite already used'}>
        <div className={styles.form}>
          <p className={styles.alert} role="alert">
            {expired
              ? 'This invite has expired. Please ask the Super Admin to send a new one.'
              : 'This invite has already been used. Sign in with the password you set.'}
          </p>
          <Button fullWidth onClick={close}>Close</Button>
        </div>
      </AuthLayout>
    );
  }

  const ruleError = tried && !password ? 'Please enter a new password.' : tried && !meetsPasswordRules(password) ? PASSWORD_RULES_ERROR : undefined;
  const matchError = tried && confirm !== password ? 'The passwords don’t match.' : undefined;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!meetsPasswordRules(password) || confirm !== password) return;
    run(() => {
      useAuthSecurity.getState().setPassword(password);
      useAdminStore.setState({ email: admin.email, role: admin.role });
      useAdminStore.getState().completeAdminSetup(admin.id);
      useAdminStore.getState().signIn(admin.email);
      useInviteLink.getState().clear();
      useAdminNav.setState({ stack: [{ id: 'dashboard' }], drawer: null, drawerClosing: false, auth: 'signIn', navOpen: false });
    }, `${admin.firstName}, your account is ready.`);
  };

  return (
    <AuthLayout title="Set your password" intro="Create a password for the work email this invite was sent to. You’ll go straight to your dashboard.">
      <form className={styles.form} onSubmit={submit} noValidate>
        <Input label="Email" type="email" value={admin.email} readOnly disabled />
        <div className={styles.rulesBox}>
          <p className={styles.rulesTitle}>Your password needs</p>
          <ul className={styles.rules}>
            {PASSWORD_RULES.map((r) => (
              <li key={r.id} className={styles.rule} data-met={r.test(password) || undefined}><Icon name="check" size={14} />{r.label}</li>
            ))}
          </ul>
        </div>
        <Input label="Password" type="password" autoComplete="new-password" value={password} error={ruleError} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={confirm} error={matchError} onChange={(e) => setConfirm(e.target.value)} />
        <Button type="submit" fullWidth loading={busy}>Set password</Button>
      </form>
    </AuthLayout>
  );
}
