/** Change password: current, new (with live rules), confirm. Simulated; nothing is stored. */
import { useState } from 'react';
import { formatDate, useAdminSettings } from '@shared/admin';
import { Button, Icon, Input } from '@admin/ui';
import { Section } from '@admin/patterns';
import { useSim } from '@admin/hooks/useSim';
import s from './settings.module.css';

const RULES = [
  { id: 'len', label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { id: 'num', label: 'A number', test: (p: string) => /\d/.test(p) },
  { id: 'sym', label: 'A symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { id: 'case', label: 'Upper and lower case letters', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
];

export function PasswordSection() {
  const changedAt = useAdminSettings((st) => st.passwordChangedAt);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);
  const sim = useSim();

  const rulesMet = RULES.every((r) => r.test(next));
  const mismatch = confirm.length > 0 && confirm !== next;
  const sameAsOld = next.length > 0 && next === current;
  const ready = current && rulesMet && confirm === next && !sameAsOld;

  const save = () => {
    setTried(true);
    if (!ready) return;
    sim.run(() => {
      useAdminSettings.getState().changePassword();
      setCurrent(''); setNext(''); setConfirm(''); setTried(false);
    }, 'Password changed', 900);
  };

  return (
    <Section title="Password" surface>
      <div className={s.form}>
        <p className={s.note}>Last changed {formatDate(changedAt)}.</p>
        <Input label="Current password" type="password" autoComplete="current-password" value={current}
          error={tried && !current ? 'Enter your current password.' : undefined} onChange={(e) => setCurrent(e.target.value)} />
        <Input label="New password" type="password" autoComplete="new-password" value={next}
          error={sameAsOld ? 'Choose a password you haven’t used here.' : undefined} onChange={(e) => setNext(e.target.value)} />
        <ul className={s.rules} aria-label="Password rules">
          {RULES.map((r) => (
            <li key={r.id} className={s.rule} data-met={r.test(next) || undefined}>
              <Icon name={r.test(next) ? 'check' : 'close'} size={14} />
              {r.label}
            </li>
          ))}
        </ul>
        <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm}
          error={mismatch ? 'Passwords don’t match.' : undefined} onChange={(e) => setConfirm(e.target.value)} />
        <div className={s.actions}>
          <Button size="sm" loading={sim.busy} disabled={!current && !next && !confirm} onClick={save}>Change password</Button>
        </div>
        <p className={s.note}>Changing your password signs you out on your other devices.</p>
      </div>
    </Section>
  );
}
